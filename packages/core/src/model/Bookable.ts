import AbstractEntity from '~/model/AbstractEntity';

export default class Bookable extends AbstractEntity {
  name!: string;
  description!: string;
}
