import { AbstractEntity, Ref } from '~/model/AbstractEntity';

import { Space } from './Space';

export class User extends AbstractEntity {
  name?: string;
  email!: string;
  starredSpaces!: Ref<Space>[];

  constructor(data: Partial<User> = {}) {
    super();
    Object.assign(this, data);
  }
}
