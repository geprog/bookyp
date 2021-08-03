import AbstractEntity, { Ref } from '~/model/AbstractEntity';
import Space from '~/model/Space';

export default class Bookable extends AbstractEntity {
  name!: string;
  description!: string;
  space!: Ref<Space>;
}
