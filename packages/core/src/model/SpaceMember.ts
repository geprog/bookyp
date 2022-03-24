import { Ref } from '~/model/AbstractEntity';
import User from '~/model/auth/User';
import Space from '~/model/Space';

export default class SpaceMember {
  role!: 'admin' | 'user';
  userId!: Ref<User>;
  email!: User['email'];
  name: User['name'];
  spaceId!: Ref<Space>;
  _id!: SpaceMember['userId'];
}
