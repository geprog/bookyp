import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { Id, NullableId, Params } from '@feathersjs/feathers';

import { createSpaceSubscription, updateSpaceSubscription } from '~/lib/paymentsApi';
import { requireUser } from '~/utils';

class SpaceSubscriptionsService extends AdapterService<Model.SpaceSubscription> {
  app: Application;

  constructor(app: Application) {
    super({});
    this.app = app;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get(id: Id, _params?: Params): Promise<Model.SpaceSubscription> {
    const space = await this.app.service('spaces').get(id);

    return {
      space: space._id,
      plan: space.plan,
    };
  }

  async patch(id: Id, data: Partial<Model.SpaceSubscription>, params?: Params): Promise<Model.SpaceSubscription>;
  async patch(id: null, data: Partial<Model.SpaceSubscription>, params?: Params): Promise<Model.SpaceSubscription[]>;
  async patch(
    id: NullableId,
    data: Partial<Model.SpaceSubscription>,
    params?: Params,
  ): Promise<Model.SpaceSubscription | Model.SpaceSubscription[]> {
    const spaceId = id as string;
    if (!spaceId) {
      throw new Error('Please provide a space id');
    }

    const _user = requireUser(params);
    const user = await this.app.service('users').get(_user._id);

    const plan = data.plan;
    if (!plan) {
      throw new Error('Please provide a plan');
    }

    if (!Object.keys(Model.SpacePlans).includes(plan)) {
      throw new Error(`Plan type "${plan}" is not one of ${Object.keys(Model.SpacePlans).join(',')}`);
    }

    const space = await this.app.service('spaces').get(spaceId);

    if (space.requestedPlan) {
      throw new Error('Already requested an up/downgrade');
    }

    space.requestedPlan = plan;

    if (space.subscription) {
      await updateSpaceSubscription(this.app, space);

      await this.app.service('spaces').patch(space._id, {
        plan,
        requestedPlan: undefined,
      });

      return {
        space: spaceId,
        plan,
      };
    }

    await createSpaceSubscription(this.app, user, space);

    await this.app.service('spaces').patch(spaceId, { plan });

    return {
      space: spaceId,
      plan,
    };
  }
}

const name = 'spaceSubscriptions';

export default (app: Application): void => {
  app.use(name, new SpaceSubscriptionsService(app));
};
