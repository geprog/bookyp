import { Ref } from '~/model/AbstractEntity';
import { Space, SpacePlan } from '~/model/Space';

export type SpaceSubscription = {
  space: Ref<Space>;
  plan: SpacePlan;
  checkoutUrl?: string;
};
