import AbstractEntity, { Ref } from '~/model/AbstractEntity';
import User from '~/model/auth/User';

type Member = {
  role: 'admin' | 'user';
  userId: Ref<User>;
};

export default class Space extends AbstractEntity {
  floorPlan!: string[];
  members!: Member[];
}
