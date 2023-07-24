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

  if (!space.requestedPlan) {
    throw new Error('No space requested');
  }

  const pricePerUnit = Model.SpacePlans[space.requestedPlan].pricePerUnit;
  const units = space.plan === 'public' ? 1 : space.members.length;

  const customerId = user.paymentCustomerId;
  if (!customerId) {
    throw new Error('First create a customer please');
  }

  if (!config.app.frontendUrl) {
    throw new Error('Frontend url not configured');
  }

  const response = await payment.subscription.subscriptionCreate({
    pricePerUnit,
    units,
    customerId,
  });

  const subscription = response.data;
  await app.service('spaces').patch(space._id, {
    subscription: subscription._id,
    activeUntil: subscription.activeUntil ? new Date(subscription.activeUntil) : undefined,
  });
}

export async function updateSpaceSubscription(space: Model.Space): Promise<void> {
  const payment = gringottsPayments();

  if (!space.subscription) {
    throw new Error('You first need a subscription for this space');
  }

  if (!space.requestedPlan) {
    throw new Error('No plan requested');
  }

  const pricePerUnit = Model.SpacePlans[space.requestedPlan].pricePerUnit;
  const units = space.plan === 'public' ? 1 : space.members.length;

  await payment.subscription.subscriptionPartialUpdate(space.subscription, {
    pricePerUnit,
    units,
  });
}
