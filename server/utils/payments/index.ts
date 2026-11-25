import type { PaymentCustomer, SpacePlan, SpaceSubscription } from '#shared/types/models';
import type { DbInvoice, DbPaymentCustomer, DbSpace } from '../dbTypes';
import type { CurrentUser } from '../session';
import type { PaymentProvider, ProviderPayment, ProviderSubscription } from './provider';
import dayjs from 'dayjs';
import { isBillingComplete } from '#shared/utils/billing';
import { getActivePlan, getCurrentPlan, proratedUpgradePrice, spacePlans } from '#shared/utils/plans';
import { mockProvider } from './mock';
import { createMollieProvider } from './mollie';

export * from './provider';

/** days a plan stays active after the next payment is due, so pending payments (e.g. SEPA) do not interrupt the service */
const gracePeriodDays = 7;

let mollieProvider: PaymentProvider | undefined;

export function usePaymentProvider(): PaymentProvider {
  const { payment } = useRuntimeConfig();
  if (payment.provider === 'mollie') {
    if (!payment.mollieApiKey) {
      throw createError({ statusCode: 500, statusMessage: 'NUXT_PAYMENT_MOLLIE_API_KEY is not configured' });
    }
    mollieProvider ??= createMollieProvider(payment.mollieApiKey);
    return mollieProvider;
  }
  return mockProvider;
}

export function isMockPaymentProvider(): boolean {
  return useRuntimeConfig().payment.provider !== 'mollie';
}

export function paymentWebhookUrl(appUrl: string): string {
  return `${appUrl}/api/payment/webhook`;
}

export function getVatRate(): number {
  return Number(useRuntimeConfig().payment.vatRate) || 0;
}

export function getCurrency(): string {
  return useRuntimeConfig().payment.currency || 'EUR';
}

function roundPrice(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/** adds the vat to a net amount */
export function withVat(net: number): number {
  return roundPrice(net * (1 + getVatRate() / 100));
}

/** gross price per month of a plan */
export function grossPrice(plan: SpacePlan): number {
  return withVat(spacePlans[plan].pricePerMonth);
}

export function serializeCustomer(customer: DbPaymentCustomer | null): PaymentCustomer {
  return {
    type: customer?.type ?? 'business',
    organizationName: customer?.organizationName ?? '',
    vatNumber: customer?.vatNumber ?? '',
    organizationNumber: customer?.organizationNumber ?? '',
    givenName: customer?.givenName ?? '',
    familyName: customer?.familyName ?? '',
    email: customer?.email ?? '',
    addressLine1: customer?.addressLine1 ?? '',
    addressLine2: customer?.addressLine2 ?? '',
    zipCode: customer?.zipCode ?? '',
    city: customer?.city ?? '',
    country: customer?.country ?? '',
    language: customer?.language ?? 'en',
    activePaymentMethod: customer?.activePaymentMethod,
    exists: !!customer?.providerCustomerId,
  };
}

export async function getPaymentCustomer(userId: string): Promise<DbPaymentCustomer | null> {
  const { paymentCustomers } = await useCollections();
  return paymentCustomers.findOne({ userId });
}

type ProviderCustomer = DbPaymentCustomer & { providerCustomerId: string };

/** The customer of the user that is ready to pay (exists at the provider and has a valid payment method). */
async function requirePayingCustomer(userId: string): Promise<ProviderCustomer & { activePaymentMethod: string }> {
  const customer = await getPaymentCustomer(userId);
  if (!customer?.providerCustomerId) {
    apiError(400, 'payment_customer_required', 'Please add your billing details first');
  }
  if (!customer.activePaymentMethod) {
    apiError(400, 'payment_method_required', 'Please select a payment method first');
  }
  const mandates = await usePaymentProvider().listMandates(customer.providerCustomerId);
  if (!mandates.some(mandate => mandate.id === customer.activePaymentMethod && mandate.status !== 'invalid')) {
    apiError(400, 'payment_method_required', 'The selected payment method is not valid anymore');
  }
  return customer as ProviderCustomer & { activePaymentMethod: string };
}

/** The customer of the user with complete billing details (needed before anything is paid). */
async function requireBillingCustomer(userId: string): Promise<ProviderCustomer> {
  const customer = await getPaymentCustomer(userId);
  if (!customer?.providerCustomerId || !isBillingComplete(customer)) {
    apiError(400, 'payment_customer_required', 'Please add your billing details first');
  }
  return customer as ProviderCustomer;
}

/** end of the period the last payment of the subscription covers */
function periodEndFor(subscription: ProviderSubscription): Date {
  const next = subscription.nextPaymentDate ? dayjs(subscription.nextPaymentDate) : undefined;
  return (next?.isAfter(dayjs()) ? next : dayjs().add(1, 'month')).toDate();
}

function activeUntilFor(subscription: ProviderSubscription): Date | undefined {
  if (subscription.status !== 'active' && subscription.status !== 'pending') {
    return undefined;
  }
  return dayjs(periodEndFor(subscription)).add(gracePeriodDays, 'day').toDate();
}

function subscriptionDescription(space: DbSpace, plan: SpacePlan): string {
  return `Bookyp ${plan} plan - ${space.name} (${space._id.toString()})`;
}

function subscriptionState(space: DbSpace, status: SpaceSubscription['status'] = 'none'): SpaceSubscription {
  return {
    space: space._id.toString(),
    plan: space.plan ?? 'free',
    activeUntil: space.activeUntil?.toISOString(),
    currentPeriodEnd: space.currentPeriodEnd?.toISOString(),
    scheduledPlan: space.scheduledPlan,
    status,
  };
}

/** The running subscription of a space and the customer that pays it. */
async function getLiveSubscription(space: DbSpace): Promise<{ customer: ProviderCustomer; subscription: ProviderSubscription } | undefined> {
  if (!space.subscription || !space.subscriptionOwner) {
    return undefined;
  }
  const customer = await getPaymentCustomer(space.subscriptionOwner);
  if (!customer?.providerCustomerId) {
    return undefined;
  }
  try {
    const subscription = await usePaymentProvider().getSubscription(customer.providerCustomerId, space.subscription);
    if (subscription.status !== 'active' && subscription.status !== 'pending') {
      return undefined;
    }
    return { customer: customer as ProviderCustomer, subscription };
  }
  catch (error) {
    console.error(`🔥 Could not load subscription ${space.subscription}`, error);
    return undefined;
  }
}

/** Persists a scheduled downgrade once the paid period is over. */
async function applyScheduledPlan(space: DbSpace): Promise<DbSpace> {
  const plan = getCurrentPlan(space);
  if (!space.scheduledPlan || plan !== space.scheduledPlan) {
    return space;
  }
  const { spaces } = await useCollections();
  await spaces.updateOne({ _id: space._id }, { $set: { plan }, $unset: { scheduledPlan: '' } });
  return { ...space, plan, scheduledPlan: undefined };
}

export async function getSpaceSubscription(_space: DbSpace): Promise<SpaceSubscription> {
  const space = await applyScheduledPlan(_space);
  if (!space.subscription || !space.subscriptionOwner) {
    return subscriptionState(space);
  }
  const customer = await getPaymentCustomer(space.subscriptionOwner);
  if (!customer?.providerCustomerId) {
    return subscriptionState(space);
  }
  try {
    const subscription = await usePaymentProvider().getSubscription(customer.providerCustomerId, space.subscription);
    return subscriptionState(space, subscription.status);
  }
  catch (error) {
    console.error('🔥 Could not load subscription', error);
    return subscriptionState(space);
  }
}

/**
 * Makes sure the space has a running subscription for the given plan: updates the running one
 * or creates a new one for the customer of the user (optionally starting at a later date).
 */
async function ensureSubscription(
  space: DbSpace,
  live: Awaited<ReturnType<typeof getLiveSubscription>>,
  plan: SpacePlan,
  user: CurrentUser,
  appUrl: string,
  startDate?: Date,
): Promise<{ subscription: ProviderSubscription; created: boolean }> {
  const provider = usePaymentProvider();
  const data = {
    amount: grossPrice(plan),
    currency: getCurrency(),
    description: subscriptionDescription(space, plan),
    metadata: { spaceId: space._id.toString(), plan },
  };
  if (live) {
    const subscription = await provider.updateSubscription(live.customer.providerCustomerId, live.subscription.id, data);
    return { subscription, created: false };
  }

  const customer = await requirePayingCustomer(user._id);
  const subscription = await provider.createSubscription(customer.providerCustomerId, {
    ...data,
    mandateId: customer.activePaymentMethod,
    webhookUrl: paymentWebhookUrl(appUrl),
    ...(startDate ? { startDate: dayjs(startDate).format('YYYY-MM-DD') } : {}),
  });
  const { spaces } = await useCollections();
  await spaces.updateOne({ _id: space._id }, { $set: { subscription: subscription.id, subscriptionOwner: user._id } });
  return { subscription, created: true };
}

/**
 * Changes the plan of a space.
 *
 * Without a running paid period a paid plan starts with a checkout: the customer pays the first month,
 * which also creates the payment method (mandate) for the following months. The plan switches when the
 * provider reports the payment (`handleFirstPeriodPayment`), the returned `checkoutUrl` leads there.
 * During a paid period an upgrade applies immediately and charges the price difference for the rest of
 * the period, a downgrade takes effect at the end of the period and only lowers the next payments.
 */
export async function changeSpacePlan(_space: DbSpace, plan: SpacePlan, user: CurrentUser, appUrl: string, redirectUrl: string): Promise<SpaceSubscription & { checkoutUrl?: string }> {
  const { spaces } = await useCollections();
  const space = await applyScheduledPlan(_space);
  const now = new Date();
  const periodEnd = space.currentPeriodEnd;
  const inPaidPeriod = space.plan !== 'free' && !!periodEnd && periodEnd > now && getActivePlan(space, now) === space.plan;

  if (!inPaidPeriod) {
    if (plan === 'free') {
      // nothing paid is running anymore: stop an old subscription (e.g. with failing payments)
      if (space.subscription) {
        await cancelSpaceSubscription(space);
      }
      await spaces.updateOne({ _id: space._id }, { $set: { plan: 'free' }, $unset: { subscription: '', subscriptionOwner: '', scheduledPlan: '', currentPeriodEnd: '', activeUntil: '' } });
      return subscriptionState({ ...space, plan: 'free', subscription: undefined, scheduledPlan: undefined, currentPeriodEnd: undefined, activeUntil: undefined });
    }
    const customer = await requireBillingCustomer(user._id);
    const { checkoutUrl } = await usePaymentProvider().createMandateCheckout(customer.providerCustomerId, {
      amount: grossPrice(plan),
      currency: getCurrency(),
      description: subscriptionDescription(space, plan),
      redirectUrl,
      webhookUrl: paymentWebhookUrl(appUrl),
      language: customer.language,
      metadata: { purpose: 'first-period', spaceId: space._id.toString(), plan },
    });
    return { ...subscriptionState(space), checkoutUrl };
  }

  const paidPlan = space.plan;
  const live = await getLiveSubscription(space);
  const startOfNextPeriod = periodEnd;

  if (plan === paidPlan) {
    // undo a scheduled downgrade
    if (space.scheduledPlan) {
      const { subscription } = await ensureSubscription(space, live, plan, user, appUrl, startOfNextPeriod);
      await spaces.updateOne({ _id: space._id }, { $unset: { scheduledPlan: '' } });
      return subscriptionState({ ...space, scheduledPlan: undefined }, subscription.status);
    }
    return subscriptionState(space, live?.subscription.status);
  }

  if (spacePlans[plan].pricePerMonth > spacePlans[paidPlan].pricePerMonth) {
    // upgrade: charge the difference for the rest of the period first, then switch the plan
    const customer = live?.customer ?? await requirePayingCustomer(user._id);
    const net = proratedUpgradePrice(paidPlan, plan, periodEnd, now);
    if (net >= 0.01) {
      await usePaymentProvider().createRecurringPayment(customer.providerCustomerId, {
        amount: withVat(net),
        currency: getCurrency(),
        description: `Bookyp ${paidPlan} -> ${plan} - ${space.name} (${space._id.toString()})`,
        mandateId: customer.activePaymentMethod,
        webhookUrl: paymentWebhookUrl(appUrl),
        metadata: {
          purpose: 'proration',
          spaceId: space._id.toString(),
          plan,
          previousPlan: paidPlan,
          periodStart: now.toISOString(),
          periodEnd: periodEnd.toISOString(),
        },
      });
    }
    const { subscription } = await ensureSubscription(space, live, plan, user, appUrl, startOfNextPeriod);
    await spaces.updateOne({ _id: space._id }, { $set: { plan }, $unset: { scheduledPlan: '' } });
    return subscriptionState({ ...space, plan, scheduledPlan: undefined }, subscription.status);
  }

  // downgrade: the paid plan stays until the end of the period, the next payments get cheaper
  if (plan === 'free') {
    if (space.subscription) {
      await cancelSpaceSubscription(space);
    }
    await spaces.updateOne({ _id: space._id }, { $set: { scheduledPlan: plan }, $unset: { subscription: '', subscriptionOwner: '' } });
    return subscriptionState({ ...space, scheduledPlan: plan, subscription: undefined }, 'canceled');
  }
  const { subscription } = await ensureSubscription(space, live, plan, user, appUrl, startOfNextPeriod);
  await spaces.updateOne({ _id: space._id }, { $set: { scheduledPlan: plan } });
  return subscriptionState({ ...space, scheduledPlan: plan }, subscription.status);
}

/** Cancels the subscription of a space at the payment provider (the space keeps its plan until `activeUntil`). */
export async function cancelSpaceSubscription(space: DbSpace): Promise<void> {
  if (!space.subscription || !space.subscriptionOwner) {
    return;
  }
  const owner = await getPaymentCustomer(space.subscriptionOwner);
  if (!owner?.providerCustomerId) {
    return;
  }
  try {
    await usePaymentProvider().cancelSubscription(owner.providerCustomerId, space.subscription);
  }
  catch (error) {
    console.error(`🔥 Could not cancel subscription ${space.subscription}`, error);
  }
}

/**
 * Starts the checkout for a new payment method. Nothing is charged, which the provider only supports for
 * credit card and PayPal. Other methods (e.g. direct debit) are chosen in the checkout of the first month
 * when a plan is booked (again).
 */
export function createMandateCheckout(user: CurrentUser, customer: DbPaymentCustomer & { providerCustomerId: string }, redirectUrl: string, appUrl: string): Promise<{ checkoutUrl: string }> {
  return usePaymentProvider().createMandateCheckout(customer.providerCustomerId, {
    amount: 0,
    currency: getCurrency(),
    description: `Bookyp payment method (${user.email})`,
    redirectUrl,
    webhookUrl: paymentWebhookUrl(appUrl),
    language: customer.language,
    metadata: { purpose: 'mandate' },
    methods: ['creditcard', 'paypal'],
  });
}

/** Makes the payment method the active one of the user and lets the running subscriptions of the user use it. */
export async function switchPaymentMethod(userId: string, mandateId: string): Promise<void> {
  const { paymentCustomers, spaces } = await useCollections();
  const customer = await paymentCustomers.findOneAndUpdate({ userId }, { $set: { activePaymentMethod: mandateId } }, { returnDocument: 'after' });
  if (!customer?.providerCustomerId) {
    return;
  }
  for (const space of await spaces.find({ subscriptionOwner: userId, subscription: { $exists: true } }).toArray()) {
    try {
      await usePaymentProvider().updateSubscription(customer.providerCustomerId, space.subscription!, { mandateId });
    }
    catch (error) {
      console.error(`🔥 Could not switch the payment method of subscription ${space.subscription}`, error);
    }
  }
}

/** One-off payments that belong to a space; they are told apart by `metadata.purpose`. */
export type OneOffPaymentPurpose = 'proration' | 'legacy-period';

function metadataString(payment: ProviderPayment, key: string): string | undefined {
  const value = payment.metadata?.[key];
  return typeof value === 'string' ? value : undefined;
}

const formatDate = (date: Date | string) => dayjs(date).format('DD.MM.YYYY');

/** an invoice line with the space name shortened to the 100 characters the provider allows */
function invoiceLine(template: (spaceName: string) => string, spaceName: string): string {
  const room = 100 - template('').length;
  return template(spaceName.length > room ? `${spaceName.slice(0, Math.max(room - 1, 0))}…` : spaceName);
}

/** the invoice lines of a paid payment in the language of the customer (net amounts) */
function invoiceLines(payment: ProviderPayment, space: DbSpace, plan: SpacePlan, net: number, language: string): Pick<DbInvoice, 'lines' | 'discount'> {
  const de = language === 'de';
  const purpose = metadataString(payment, 'purpose');
  const periodStart = metadataString(payment, 'periodStart');
  const periodEnd = metadataString(payment, 'periodEnd');

  if (purpose === 'proration' && periodStart && periodEnd) {
    const previousPlan = metadataString(payment, 'previousPlan') ?? '';
    const period = `${formatDate(periodStart)} - ${formatDate(dayjs(periodEnd).subtract(1, 'day').toDate())}`;
    return {
      lines: [{
        description: invoiceLine(name => de ? `Wechsel ${previousPlan} → ${plan} für "${name}", anteilig ${period}` : `Change ${previousPlan} → ${plan} for "${name}", pro rata ${period}`, space.name),
        amount: net,
      }],
    };
  }

  if (purpose === 'legacy-period' && periodStart && periodEnd) {
    // the credit of the old payment service is subtracted from the last period it billed
    const credit = Number(payment.metadata?.credit) || 0;
    const period = `${formatDate(periodStart)} - ${formatDate(dayjs(periodEnd).subtract(1, 'day').toDate())}`;
    return {
      lines: [{
        description: invoiceLine(name => de ? `Bookyp ${plan} für "${name}", ${period} (bisherige Abrechnung)` : `Bookyp ${plan} plan for "${name}", ${period} (previous billing)`, space.name),
        amount: roundPrice(net + credit),
      }],
      ...(credit > 0 ? { discount: credit } : {}),
    };
  }

  const start = new Date(payment.paidAt ?? payment.createdAt);
  const period = `${formatDate(start)} - ${formatDate(dayjs(start).add(1, 'month').subtract(1, 'day').toDate())}`;
  return {
    lines: [{
      description: invoiceLine(name => de ? `Bookyp ${plan} für "${name}", ${period}` : `Bookyp ${plan} plan for "${name}", ${period}`, space.name),
      amount: net,
    }],
  };
}

function invoiceEmail(language: string, spaceName: string): { subject: string; body: string } {
  if (language === 'de') {
    return {
      subject: `Deine Bookyp-Rechnung für "${spaceName}"`,
      body: `Moin!\n\nim Anhang findest du deine Rechnung für den Space "${spaceName}". Der Betrag wurde bereits über deine hinterlegte Zahlungsmethode bezahlt.\n\nDein Bookyp-Team`,
    };
  }
  return {
    subject: `Your Bookyp invoice for "${spaceName}"`,
    body: `Hello!\n\nattached you find your invoice for the space "${spaceName}". The amount has already been paid with your payment method.\n\nYour Bookyp team`,
  };
}

/**
 * Issues an invoice at the payment provider, which numbers it and mails it to the customer.
 * Without complete billing details the invoice stays pending until the customer completes them.
 */
async function issueInvoice(invoice: DbInvoice): Promise<void> {
  const { invoices, spaces, users } = await useCollections();
  const customer = await getPaymentCustomer(invoice.userId);
  if (!customer || !isBillingComplete(customer)) {
    await invoices.updateOne({ _id: invoice._id }, { $set: { error: 'billing_details_incomplete' } });
    console.warn(`⚠️ Invoice for payment ${invoice.providerPaymentId} waits for the billing details of user ${invoice.userId}`);
    return;
  }
  const space = isValidId(invoice.spaceId) ? await spaces.findOne({ _id: toObjectId(invoice.spaceId) }) : null;
  const user = isValidId(invoice.userId) ? await users.findOne({ _id: toObjectId(invoice.userId) }) : null;
  try {
    const issued = await usePaymentProvider().createSalesInvoice({
      recipient: {
        type: customer.type,
        organizationName: customer.organizationName,
        vatNumber: customer.vatNumber,
        organizationNumber: customer.organizationNumber,
        givenName: customer.givenName,
        familyName: customer.familyName,
        email: customer.email || user?.email || '',
        streetAndNumber: customer.addressLine1,
        streetAdditional: customer.addressLine2,
        postalCode: customer.zipCode,
        city: customer.city,
        country: customer.country,
        language: customer.language,
      },
      recipientIdentifier: invoice.userId,
      currency: invoice.currency,
      vatRate: invoice.vatRate,
      lines: invoice.lines,
      discount: invoice.discount,
      paymentId: invoice.providerPaymentId,
      email: invoiceEmail(customer.language, space?.name ?? ''),
    });
    await invoices.updateOne(
      { _id: invoice._id },
      { $set: { status: 'issued', providerInvoiceId: issued.id, ...(issued.number ? { number: issued.number } : {}) }, $unset: { error: '' } },
    );
    console.log(`🧾 Issued invoice ${issued.number ?? issued.id} for payment ${invoice.providerPaymentId}`);
  }
  catch (error) {
    console.error(`🔥 Could not issue the invoice for payment ${invoice.providerPaymentId}`, error);
    await invoices.updateOne({ _id: invoice._id }, { $set: { error: (error as Error).message } });
  }
}

/** Issues the invoices that waited for the billing details of the user. */
export async function issuePendingInvoices(userId: string): Promise<void> {
  const { invoices } = await useCollections();
  for (const invoice of await invoices.find({ userId, status: 'pending' }).toArray()) {
    await issueInvoice(invoice);
  }
}

/** Records the invoice of a paid payment (once) and issues it. */
async function createInvoice(payment: ProviderPayment, space: DbSpace, plan: SpacePlan): Promise<void> {
  const { paymentCustomers, invoices } = await useCollections();
  if (await invoices.findOne({ providerPaymentId: payment.id })) {
    return;
  }
  const customer = payment.customerId ? await paymentCustomers.findOne({ providerCustomerId: payment.customerId }) : null;
  const vatRate = getVatRate();
  const net = roundPrice(payment.amount / (1 + vatRate / 100));
  const invoice: Omit<DbInvoice, '_id'> = {
    date: new Date(payment.paidAt ?? payment.createdAt),
    status: 'pending',
    spaceId: space._id.toString(),
    userId: customer?.userId ?? space.subscriptionOwner ?? '',
    providerPaymentId: payment.id,
    plan,
    ...invoiceLines(payment, space, plan, net, customer?.language ?? 'en'),
    vatRate,
    currency: payment.currency,
    totalAmount: payment.amount,
  };
  const { insertedId } = await invoices.insertOne(invoice as DbInvoice);
  await issueInvoice({ ...invoice, _id: insertedId } as DbInvoice);
}

/** A one-off payment of a space: a paid one gets an invoice, a failed upgrade charge reverts the upgrade. */
async function handleOneOffPayment(payment: ProviderPayment): Promise<void> {
  const { spaces } = await useCollections();
  const spaceId = metadataString(payment, 'spaceId');
  const plan = metadataString(payment, 'plan') as SpacePlan | undefined;
  const space = spaceId && isValidId(spaceId) ? await spaces.findOne({ _id: toObjectId(spaceId) }) : null;
  if (!space || !plan) {
    console.warn(`⚠️ No space found for payment ${payment.id}`);
    return;
  }

  if (payment.status === 'paid') {
    await createInvoice(payment, space, plan);
    return;
  }

  const failed = payment.status === 'failed' || payment.status === 'canceled' || payment.status === 'expired';
  const previousPlan = metadataString(payment, 'previousPlan') as SpacePlan | undefined;
  if (failed && metadataString(payment, 'purpose') === 'proration' && previousPlan && space.plan === plan) {
    console.warn(`⚠️ Upgrade of space ${space.name} to ${plan} could not be charged, back to ${previousPlan}`);
    await spaces.updateOne({ _id: space._id }, { $set: { plan: previousPlan } });
    const live = await getLiveSubscription(space);
    if (live) {
      await usePaymentProvider().updateSubscription(live.customer.providerCustomerId, live.subscription.id, {
        amount: grossPrice(previousPlan),
        currency: getCurrency(),
        description: subscriptionDescription(space, previousPlan),
        metadata: { spaceId: space._id.toString(), plan: previousPlan },
      });
    }
  }
}

/**
 * The paid first month of a paid plan: the payment created the payment method (mandate), the plan
 * switches now and the subscription starts with the second month.
 */
async function handleFirstPeriodPayment(payment: ProviderPayment, appUrl: string): Promise<void> {
  const { spaces, paymentCustomers, invoices } = await useCollections();
  if (payment.status !== 'paid' || !payment.customerId || await invoices.findOne({ providerPaymentId: payment.id })) {
    // not paid (yet) or already handled
    return;
  }
  const spaceId = metadataString(payment, 'spaceId');
  const plan = metadataString(payment, 'plan') as SpacePlan | undefined;
  const found = spaceId && isValidId(spaceId) ? await spaces.findOne({ _id: toObjectId(spaceId) }) : null;
  const customer = await paymentCustomers.findOne({ providerCustomerId: payment.customerId });
  if (!found || !plan || !customer) {
    console.warn(`⚠️ No space or customer found for payment ${payment.id}`);
    return;
  }

  // an old subscription of the space (e.g. with failing payments) is replaced
  if (found.subscription) {
    await cancelSpaceSubscription(found);
  }
  const currentPeriodEnd = dayjs(dayjs(payment.paidAt ?? payment.createdAt).add(1, 'month').format('YYYY-MM-DD')).toDate();
  let subscriptionId: string | undefined;
  if (payment.mandateId) {
    await paymentCustomers.updateOne({ _id: customer._id }, { $set: { activePaymentMethod: payment.mandateId } });
    const subscription = await usePaymentProvider().createSubscription(customer.providerCustomerId!, {
      amount: grossPrice(plan),
      currency: getCurrency(),
      description: subscriptionDescription(found, plan),
      mandateId: payment.mandateId,
      webhookUrl: paymentWebhookUrl(appUrl),
      startDate: dayjs(currentPeriodEnd).format('YYYY-MM-DD'),
      metadata: { spaceId: found._id.toString(), plan },
      // a retried webhook must not start a second subscription
      idempotencyKey: `subscription-${payment.id}`,
    });
    subscriptionId = subscription.id;
  }
  else {
    console.error(`🔥 Payment ${payment.id} created no payment method, space ${found.name} gets one month without subscription`);
  }

  const space: DbSpace = {
    ...found,
    plan,
    currentPeriodEnd,
    activeUntil: dayjs(currentPeriodEnd).add(gracePeriodDays, 'day').toDate(),
    subscription: subscriptionId,
    subscriptionOwner: subscriptionId ? customer.userId : undefined,
    scheduledPlan: undefined,
  };
  await spaces.updateOne({ _id: space._id }, {
    $set: { plan, currentPeriodEnd, activeUntil: space.activeUntil!, ...(subscriptionId ? { subscription: subscriptionId, subscriptionOwner: customer.userId } : {}) },
    $unset: { scheduledPlan: '', ...(subscriptionId ? {} : { subscription: '', subscriptionOwner: '' }) },
  });
  console.log(`⏫ Space ${space.name} is on the ${plan} plan until ${dayjs(currentPeriodEnd).format('DD.MM.YYYY')}`);
  await createInvoice(payment, space, plan);
}

/** A completed checkout of a new payment method: the new payment method is used from now on. */
async function handleMandatePayment(payment: ProviderPayment): Promise<void> {
  if (payment.status !== 'paid' || !payment.customerId || !payment.mandateId) {
    return;
  }
  const { paymentCustomers } = await useCollections();
  const customer = await paymentCustomers.findOne({ providerCustomerId: payment.customerId });
  if (customer && customer.activePaymentMethod !== payment.mandateId) {
    await switchPaymentMethod(customer.userId, payment.mandateId);
  }
}

/** mails the user that pays for the space (to the invoice e-mail of the billing details, if set) */
async function notifyFailedSubscriptionPayment(space: DbSpace, appUrl: string): Promise<void> {
  if (!space.subscriptionOwner || !isValidId(space.subscriptionOwner)) {
    return;
  }
  const { users } = await useCollections();
  const owner = await users.findOne({ _id: toObjectId(space.subscriptionOwner) });
  const customer = await getPaymentCustomer(space.subscriptionOwner);
  const email = customer?.email || owner?.email;
  if (!email) {
    return;
  }
  await sendPaymentFailedMail(appUrl, space, email);
}

/**
 * Handles a status change of a payment (called by the webhook of the provider).
 * A paid subscription payment extends the plan of the space and creates an invoice.
 */
export async function handlePaymentUpdate(paymentId: string, appUrl = useRuntimeConfig().public.appUrl.replace(/\/$/, '')): Promise<void> {
  const provider = usePaymentProvider();
  const payment = await provider.getPayment(paymentId);
  console.log(`🪝 Payment ${payment.id} is ${payment.status} (${payment.sequenceType})`);

  switch (payment.metadata?.purpose) {
    case 'first-period':
      await handleFirstPeriodPayment(payment, appUrl);
      return;
    case 'mandate':
      await handleMandatePayment(payment);
      return;
    case 'proration':
    case 'legacy-period':
      await handleOneOffPayment(payment);
      return;
  }

  if (!payment.subscriptionId || !payment.customerId) {
    return;
  }

  const { spaces } = await useCollections();
  const found = await spaces.findOne({ subscription: payment.subscriptionId });
  if (!found) {
    console.warn(`⚠️ No space found for subscription ${payment.subscriptionId}`);
    return;
  }

  if (payment.status === 'failed' || payment.status === 'canceled' || payment.status === 'expired') {
    // the plan stays until `activeUntil` (grace period), the payer is asked to check the payment method
    await notifyFailedSubscriptionPayment(found, appUrl);
    return;
  }
  if (payment.status !== 'paid') {
    return;
  }

  // a new period starts: a scheduled downgrade takes effect now
  const space = await applyScheduledPlan(found);
  const subscription = await provider.getSubscription(payment.customerId, payment.subscriptionId);
  const activeUntil = activeUntilFor(subscription) ?? dayjs(payment.paidAt ?? payment.createdAt).add(1, 'month').add(gracePeriodDays, 'day').toDate();
  const currentPeriodEnd = periodEndFor(subscription);
  const $set = {
    ...(!space.activeUntil || space.activeUntil < activeUntil ? { activeUntil } : {}),
    ...(!space.currentPeriodEnd || space.currentPeriodEnd < currentPeriodEnd ? { currentPeriodEnd } : {}),
  };
  if (Object.keys($set).length > 0) {
    await spaces.updateOne({ _id: space._id }, { $set });
  }

  const plan = (metadataString(payment, 'plan') ?? space.plan) as SpacePlan;
  await createInvoice(payment, space, plan);
}
