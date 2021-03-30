import { Application, Model } from '@bookyp/core';
import { MongooseServiceOptions, Service } from 'feathers-mongoose';
import { Document, Model as MongooseModel, model, Schema } from 'mongoose';

const UserSchema = new Schema<Document, MongooseModel<Document, unknown>, Model.User>({
  name: { type: String },
  email: { type: String, required: true, unique: true },
});

export const name = 'users';

export const UserModel = model<Model.User & Document>(name, UserSchema);

export default (app: Application): void => {
  const options: Partial<MongooseServiceOptions> = {
    Model: UserModel,
  };

  app.use(name, new Service<Model.User>(options));
};
