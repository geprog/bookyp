import { AbstractEntity, Ref } from '~/model/AbstractEntity';
import { User } from '~/model/User';

export type Member = {
  role: 'admin' | 'user';
  userId: Ref<User>;
  name?: User['name'];
  email?: User['email'];
};

export type SpacePlan = 'sponsored' | 'public' | 'free';

export class Space extends AbstractEntity {
  floorPlan!: string[];
  members!: Member[];
  name!: string;
  description?: string;
  address?: string;
  email?: string;
  plan?: SpacePlan;
  image?: string;

  constructor(data: Partial<Space> = {}) {
    super();
    Object.assign(this, data);
  }
}
