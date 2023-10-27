import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { Id, NullableId, Params } from '@feathersjs/feathers';
import { ContentType } from '@geprog/gringotts-client';

import { gringottsPayments } from '~/lib/paymentsApi';
import { requireUser } from '~/utils';

class PaymentCustomerService extends AdapterService<Model.PaymentCustomer> {
  app: Application;

  constructor(app: Application) {
    super({});
    this.app = app;
  }

  async get(id: Id, params?: Params): Promise<Model.PaymentCustomer> {
    const _user = requireUser(params);

    // fix as the user is not updated in the params
    const user = await this.app.service('users').get(_user._id);

    if (!user?.paymentCustomerId) {
      return { _id: 'ignore' };
    }

    const payment = gringottsPayments();

    const response = await payment.customer.customerDetail(user.paymentCustomerId);
    const customer = response.data;

    return customer;
  }

  async patch(id: Id, data: Partial<Model.PaymentCustomer>, params?: Params): Promise<Model.PaymentCustomer>;
  async patch(id: null, data: Partial<Model.PaymentCustomer>, params?: Params): Promise<Model.PaymentCustomer[]>;
  async patch(
    id: NullableId,
    data: Partial<Model.PaymentCustomer>,
    params?: Params,
  ): Promise<Model.PaymentCustomer | Model.PaymentCustomer[]> {
    const payment = gringottsPayments();

    const _user = requireUser(params);

    // fix as the user is not updated in the params
    const user = await this.app.service('users').get(_user._id);

    if (!user.paymentCustomerId) {
      const response = await payment.customer.customerCreate(
        {
          name: data?.name || '',
          email: data?.email || '',
          addressLine1: data?.addressLine1 || '',
          addressLine2: data?.addressLine2 || '',
          city: data?.city || '',
          country: data?.country || '',
          zipCode: data?.zipCode || '',
        },
        { type: ContentType.Json },
      );

      user.paymentCustomerId = response.data._id;
      await this.app.service('users').patch(user._id, {
        paymentCustomerId: user.paymentCustomerId,
      });
      return response.data;
    }

    const response = await payment.customer.customerPartialUpdate(
      user.paymentCustomerId,
      {
        name: data?.name || '',
        email: data?.email || '',
        addressLine1: data?.addressLine1 || '',
        addressLine2: data?.addressLine2 || '',
        city: data?.city || '',
        country: data?.country || '',
        zipCode: data?.zipCode || '',
        activePaymentMethod: data?.activePaymentMethod,
      },
      { type: ContentType.Json },
    );

    return response.data;
  }
}

const name = 'paymentCustomers';

export default (app: Application): void => {
  app.use(name, new PaymentCustomerService(app));
};
