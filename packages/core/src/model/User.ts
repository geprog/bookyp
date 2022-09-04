import { AbstractEntity } from '~/model/AbstractEntity';

export class User extends AbstractEntity {
  name?: string;
  email!: string;

  constructor(data: Partial<User> = {}) {
    super();
    Object.assign(this, data);
  }
}
