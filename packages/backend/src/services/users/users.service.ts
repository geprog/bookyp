import { Application, Model } from '@bookyp/core';
import { HookContext } from '@feathersjs/feathers';
import { authorize } from 'feathers-casl';
import { MongooseServiceOptions, Service } from 'feathers-mongoose';
import { Document, model, Schema } from 'mongoose';

import { feathersCaslAllowlist } from '~/casl';
import { defineAbilitiesFor } from '~/services/authentication/authentication.abilities';

import emailToLowerCase from './hooks/emailToLowerCase';
import { populateIsSuperAdmin } from './hooks/populateIsSuperAdmin';

const UserSchema = new Schema<Model.User>({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  paymentCustomerId: { type: String },
  starredSpaces: { type: [String], required: true },
  isSuperAdmin: { type: Boolean },
});

export const name = 'users';

export const UserModel = model<Model.User & Document>(name, UserSchema);

export default (app: Application): void => {
  const options: Partial<MongooseServiceOptions> = {
    Model: UserModel,
    whitelist: feathersCaslAllowlist,
  };

  app.use(name, new Service<Model.User>(options));
  app.service(name).hooks({
    before: {
      get: [
        // see https://github.com/fratzinger/feathers-casl/issues/52
        (context: HookContext<Application>) => {
          if (context.params.ability) {
            return context;
          }
          const { user } = context.params as { user: Model.User };
          if (user) {
            context.params.ability = defineAbilitiesFor(user, context.app);
          }
          return context;
        },
        authorize({ adapter: 'feathers-mongoose' }),
      ],
      create: [emailToLowerCase],
      update: [emailToLowerCase],
    },
    after: {
      get: [populateIsSuperAdmin],
      find: [populateIsSuperAdmin],
    },
  });
};
