import { Ref } from '~/model/AbstractEntity';
import Space from '~/model/Space';
import User from '~/model/User';

export default class SpaceMember {
  role!: 'admin' | 'user';
  userId!: Ref<User>;
  email!: User['email'];
  name: User['name'];
  spaceId!: Ref<Space>;
  _id!: SpaceMember['userId'];

  constructor(data: Partial<SpaceMember> = {}) {
    Object.assign(this, data);
  }
}
