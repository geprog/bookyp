import { Application, Model } from '@bookyp/core';
import { json, Request, Response, Router } from 'express';

import { gringottsPayments } from '~/lib/paymentsApi';

export default function PaymentsWebhookRouter(app: Application): Router {
  const router = Router();

  router.use(json());

  // endpoint to receive webhooks from gringotts
  router.post('/payments/webhook', (req: Request, res: Response) => {
    try {
      void (async () => {
        const body = req.body as { subscriptionId: string };
        if (!body?.subscriptionId) {
          res.status(400).send({ error: 'Expected to get a subscriptionId' });
          return;
        }

        // eslint-disable-next-line no-console
        console.log('🪝 Received webhook', body.subscriptionId);

        const payment = gringottsPayments();
        const response = await payment.subscription.subscriptionDetail(body.subscriptionId);
        const subscription = response.data;

        const spaces = (await app
          .service('spaces')
          .find({ query: { subscription: body.subscriptionId } })) as Model.Space[];
        if (spaces.length !== 1) {
          throw new Error('No space found or more than one.');
        }
        const space = spaces[0];

        await app.service('spaces').update(space._id, {
          ...space,
          activeUntil: subscription.activeUntil ? new Date(subscription.activeUntil) : undefined,
          plan: space.requestedPlan,
          requestedPlan: undefined,
        });

        res.status(200).send({ ok: true });
      })();
    } catch (e) {
      const error = e as Error;
      // eslint-disable-next-line no-console
      console.log(`🔥 Error`, error);
      res.status(500).send({ error: error.message });
    }
  });

  return router;
}
