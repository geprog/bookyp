import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { Params } from '@feathersjs/feathers';

import { gringottsPayments } from '~/lib/paymentsApi';

class InvoiceService extends AdapterService<Model.Invoice> {
  app: Application;

  constructor(app: Application) {
    super({});
    this.app = app;
  }

  async find(params?: Params): Promise<Model.Invoice[]> {
    const _user = params?.user as Model.User;
    const { spaceId } = params?.query as { spaceId?: string };

    if (!_user) {
      // TODO: use proper feathers error
      throw new Error('Not found');
    }

    if (!spaceId) {
      throw new Error('No spaceId in query');
    }

    const space = await this.app.service('spaces').get(spaceId);

    if (!space.subscription) {
      return [];
    }

    const payment = gringottsPayments();

    const { data: invoices } = await payment.subscription.invoiceDetail(space.subscription);
    if (!invoices) {
      // TODO: use proper feathers error
      throw new Error('Invoices not found');
    }

    return invoices;
  }
}

const name = 'invoices';

export default (app: Application): void => {
  app.use(name, new InvoiceService(app));
};
