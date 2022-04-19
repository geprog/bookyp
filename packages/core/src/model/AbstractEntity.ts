import ObjectID from 'bson-objectid';

export default abstract class AbstractEntity {
  readonly _id!: string;
  deleted?: boolean;

  constructor(data: Partial<AbstractEntity> = {}) {
    this._id = new ObjectID().toString();
    Object.assign(this, data);
  }
}

export type Ref<T extends AbstractEntity> = T['_id'];
