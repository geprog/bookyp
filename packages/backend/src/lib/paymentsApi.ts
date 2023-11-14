import { Application, Model } from '@bookyp/core';
import { Api, gringottsClient } from '@geprog/gringotts-client';
import fetch from 'cross-fetch';

import getConfig from '~/config';

export function gringottsPayments(): Api<unknown> {
  const paymentConfig = getConfig().payment;

  if (!paymentConfig.gringottsUrl) {
    throw new Error('Please configure BACKEND_PAYMENT_URL');
  }

  if (!paymentConfig.gringottsToken) {
    throw new Error('Please configure BACKEND_PAYMENT_TOKEN');
  }

  return gringottsClient(paymentConfig.gringottsUrl, {
    token: paymentConfig.gringottsToken,
    customFetch: fetch,
  });
}

export async function createSpaceSubscription(app: Application, user: Model.User, space: Model.Space): Promise<void> {
  const config = getConfig();
  const payment = gringottsPayments();

  const pricePerUnit = Model.SpacePlans[space.plan].pricePerUnit;

  const customerId = user.paymentCustomerId;
  if (!customerId) {
    throw new Error('First create a customer please');
  }

  if (!config.app.frontendUrl) {
    throw new Error('Frontend url not configured');
  }

  const response = await payment.subscription.createSubscription({
    pricePerUnit,
    units: 1,
    customerId,
    metadata: {
      spaceId: space._id,
    },
  });

  const subscription = response.data;
  const isActive = subscription.status === 'active' || subscription.status === 'processing';
  const activeUntil = isActive && subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : undefined;
  await app.service('spaces').patch(space._id, {
    subscription: subscription._id,
    activeUntil,
  });
}

export async function updateSpaceSubscription(space: Model.Space): Promise<Date | undefined> {
  const payment = gringottsPayments();

  if (!space.subscription) {
    throw new Error('You first need a subscription for this space');
  }

  const pricePerUnit = Model.SpacePlans[space.plan].pricePerUnit;

  await payment.subscription.patchSubscription(space.subscription, {
    pricePerUnit,
    units: 1,
    metadata: {
      spaceId: space._id,
    },
  });

  // check if a subscription is currently active and set the activeUntil date to the end of the current period
  const response = await payment.subscription.getSubscription(space.subscription);
  const subscription = response.data;
  const isActive = subscription.status === 'active' || subscription.status === 'processing';
  return isActive && subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : undefined;
}

export async function cancelSubscription(space: Model.Space): Promise<void> {
  const payment = gringottsPayments();

  if (!space.subscription) {
    throw new Error('You first need a subscription for this space');
  }

  await payment.subscription.patchSubscription(space.subscription, {
    status: 'canceled',
  });
}
