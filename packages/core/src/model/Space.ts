import AbstractEntity, { Ref } from '~/model/AbstractEntity';
import User from '~/model/User';

type Member = {
  role: 'admin' | 'user';
  userId: Ref<User>;
};

export default class Space extends AbstractEntity {
  floorPlan!: string[];
  members!: Member[];
  name!: string;
  description?: string;
  address?: string;

  constructor(data: Partial<Space> = {}) {
    super();
    Object.assign(this, data);
  }
}
