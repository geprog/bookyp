import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { Id, Params } from '@feathersjs/feathers';

import { gringottsPayments } from '~/lib/paymentsApi';
import { requireUser } from '~/utils';

class InvoiceDownloadService extends AdapterService<Model.InvoiceDownload> {
  app: Application;

  constructor(app: Application) {
    super({});
    this.app = app;
  }

  async get(id: Id, params?: Params): Promise<Model.InvoiceDownload> {
    requireUser(params);

    const { spaceId } = params?.query as { spaceId?: string };
    if (!spaceId) {
      throw new Error('No spaceId in query');
    }

    const space = await this.app.service('spaces').get(spaceId);
    if (!space.subscription) {
      throw new Error('No subscription in space');
    }

    const payment = gringottsPayments();

    // TODO: improve invoice is part of subscription check
    const { data: invoices } = await payment.subscription.listSubscriptionInvoices(space.subscription);
    if (!invoices || !invoices.find((invoice) => invoice._id === id)) {
      // TODO: use proper feathers error
      throw new Error('Invoice not found');
    }

    const { data } = await payment.invoice.generateInvoiceDownloadLink(id.toString());
    return data;
  }
}

const name = 'invoice-download';

export default (app: Application): void => {
  app.use(name, new InvoiceDownloadService(app));
};
