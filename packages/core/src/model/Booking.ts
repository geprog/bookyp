import AbstractEntity, { Ref } from '~/model/AbstractEntity';
import Bookable from '~/model/Bookable';
import Space from '~/model/Space';
import User from '~/model/User';

export default class Booking extends AbstractEntity {
  start!: Date;
  end!: Date;
  bookedBy!: Ref<User>;
  bookable!: Ref<Bookable>;
  description!: string;
  space!: Ref<Space>;

  constructor(data: Partial<Booking> = {}) {
    super();
    Object.assign(this, data);
  }
}
