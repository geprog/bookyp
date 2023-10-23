import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext, Id, NullableId, Paginated, Params } from '@feathersjs/feathers';

import { gringottsPayments } from '~/lib/paymentsApi';
import { getUser } from '~/utils';

class PaymentMethodService extends AdapterService<Model.PaymentMethod> {
  app: Application;

  constructor(app: Application) {
    super({});
    this.app = app;
  }

  async get(_id: Id, params?: Params): Promise<Model.PaymentMethod> {
    const _user = getUser(params, { requireUser: true });

    // fix as the user is not updated in the params
    const user = await this.app.service('users').get(_user._id);

    if (!user?.paymentCustomerId) {
      throw new Error('Create a payment customer first');
    }

    const payment = gringottsPayments();

    const response = await payment.customer.paymentMethodDetail2(user.paymentCustomerId, _id as string);
    return response.data;
  }

  async find(params?: Params): Promise<Model.PaymentMethod[] | Paginated<Model.PaymentMethod>> {
    const _user = getUser(params, { requireUser: true });

    // fix as the user is not updated in the params
    const user = await this.app.service('users').get(_user._id);
    if (!user?.paymentCustomerId) {
      // TODO: use proper feathers error
      throw new Error('Create a payment customer first');
    }

    const payment = gringottsPayments();

    const response = await payment.customer.paymentMethodDetail(user.paymentCustomerId);
    return response.data;
  }

  async create(data: Partial<Model.PaymentMethod>, params?: Params): Promise<Model.PaymentMethod>;
  async create(data: Partial<Model.PaymentMethod>[], params?: Params): Promise<Model.PaymentMethod[]>;
  async create(
    data: Partial<Model.PaymentMethod> | Partial<Model.PaymentMethod>[],
    params?: Params,
  ): Promise<Model.PaymentMethod | Model.PaymentMethod[]> {
    if (Array.isArray(data)) {
      // TODO: use proper feathers error
      throw new Error('Create one payment method at a time');
    }

    const _user = getUser(params, { requireUser: true });

    // fix as the user is not updated in the params
    const user = await this.app.service('users').get(_user._id);
    if (!user?.paymentCustomerId) {
      // TODO: use proper feathers error
      throw new Error('Create a payment customer first');
    }

    const redirectUrl = params?.query?.redirectUrl as string;
    if (!redirectUrl) {
      // TODO: use proper feathers error
      throw new Error('Please provide a redirectUrl');
    }

    const payment = gringottsPayments();
    const response = await payment.customer.paymentMethodCreate(user.paymentCustomerId, {
      redirectUrl,
    });

    return response.data;
  }

  async remove(id: Id, params?: Params): Promise<Model.PaymentMethod>;
  async remove(id: null, params?: Params): Promise<Model.PaymentMethod[]>;
  async remove(_id: NullableId, params?: Params): Promise<Model.PaymentMethod | Model.PaymentMethod[]> {
    const id = _id as string;
    if (!id) {
      // TODO: use proper feathers error
      throw new Error('Please provide an id');
    }

    const _user = getUser(params, { requireUser: true });

    // fix as the user is not updated in the params
    const user = await this.app.service('users').get(_user._id);
    if (!user.paymentCustomerId) {
      // TODO: use proper feathers error
      throw new Error('Create a payment customer first');
    }

    const payment = gringottsPayments();
    const response = await payment.customer.paymentMethodDetail2(user.paymentCustomerId, id);

    await payment.customer.paymentMethodDelete(user.paymentCustomerId, id);

    return response.data;
  }
}

const name = 'payment-methods';

export default (app: Application): void => {
  app.use(name, new PaymentMethodService(app));
  app.service(name).hooks({
    after: {
      create: (ctx: HookContext) => ({ ...ctx, event: null }),
    },
  });
};
