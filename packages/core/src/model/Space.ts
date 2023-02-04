import { AbstractEntity, Ref } from '~/model/AbstractEntity';
import { User } from '~/model/User';

export type Member = {
  role: 'admin' | 'user';
  userId: Ref<User>;
  name?: User['name'];
  email?: User['email'];
};

export type SpacePlan = 'free' | 'enterprise' | 'public';

export class Space extends AbstractEntity {
  floorPlan!: string[];
  members!: Member[];
  name!: string;
  description?: string;
  address?: string;
  plan: SpacePlan = 'free';
  activeUntil?: Date; // a timestamp until which the plan is valid (undefined / past timestamp sets the plan back to default: free)
  email?: string;
  image?: string;

  constructor(data: Partial<Space> = {}) {
    super();
    Object.assign(this, data);
  }
}
