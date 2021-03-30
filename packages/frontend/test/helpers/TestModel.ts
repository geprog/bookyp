import { Model } from '@bookyp/core';

export default class Bookable extends Model.AbstractEntity {
  mood!: string;
  action!: string;
}
