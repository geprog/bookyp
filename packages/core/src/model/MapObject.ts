import { AbstractEntity, Ref } from '~/model/AbstractEntity';
import { Bookable } from '~/model/Bookable';
import { Space } from '~/model/Space';
import { MapObjectTypes } from '~/model/TemplateGenerator';

export class MapObject extends AbstractEntity {
  /**
   * position in x-axis from the top left corner
   * one unit represents 1m
   * reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform
   */
  xPos!: number;
  /**
   * position in y-axis from the top left corner
   * one unit represents 1m
   */
  yPos!: number;
  /**
   * clockwise rotation with the top left corner as anchor point in degree
   */
  rotation!: number;
  /**
   * each item being the value for the attribute d of one svg-path
   */
  paths!: string[];
  /**
   * describes the type of the mapObject to be able to handle them differently
   */
  type!: MapObjectTypes;
  /**
   * reference to a bookable for which this mapObject is a representation
   */
  bookable?: Ref<Bookable>;

  space!: Ref<Space>;

  constructor(data: Partial<MapObject> = {}) {
    super();
    Object.assign(this, data);
  }
}
