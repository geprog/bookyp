import { AbstractEntity, Ref } from '~/model/AbstractEntity';
import { Space } from '~/model/Space';

export class Bookable extends AbstractEntity {
  name!: string;
  description!: string;
  space!: Ref<Space>;

  constructor(data: Partial<Bookable> = {}) {
    super();
    Object.assign(this, data);
  }
}
