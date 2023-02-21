import { AbstractEntity, Ref } from '~/model/AbstractEntity';

import { Space } from './Space';

export class User extends AbstractEntity {
  name?: string;
  email!: string;
  paymentCustomerId?: string;
  starredSpaces!: Ref<Space>[];
  isAdmin?: boolean;

  constructor(data: Partial<User> = {}) {
    super();
    Object.assign(this, data);
  }
}
