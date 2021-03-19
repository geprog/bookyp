import AbstractEntity, { Ref } from '~/model/AbstractEntity';
import User from '~/model/auth/User';
import Bookable from '~/model/Bookable';

export default class Booking extends AbstractEntity {
  start!: Date;
  end!: Date;
  bookedBy!: Ref<User>;
  bookable!: Ref<Bookable>;
  description!: string;
}
