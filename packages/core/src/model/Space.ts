import { AbstractEntity, Ref } from '~/model/AbstractEntity';
import { User } from '~/model/User';

export const SpacePlans = {
  free: {
    pricePerUnit: 0,
  },
  enterprise: {
    pricePerUnit: 1.5,
  },
  public: {
    pricePerUnit: 15,
  },
};

export type Member = {
  role: 'admin' | 'user';
  userId: Ref<User>;
  name?: User['name'];
  email?: User['email'];
};

export type SpacePlan = keyof typeof SpacePlans;

export class Space extends AbstractEntity {
  floorPlan!: string[];
  members!: Member[];
  name!: string;
  description?: string;
  address?: string;
  plan: SpacePlan = 'free';
  activeUntil?: Date; // a timestamp until which the plan is valid (undefined / past timestamp sets the plan back to default: free)
  requestedPlan?: SpacePlan;
  subscription?: string;
  email?: string;
  image?: string;
  coordinates?: { lng: number; lat: number };

  constructor(data: Partial<Space> = {}) {
    super();
    Object.assign(this, data);
  }
}
