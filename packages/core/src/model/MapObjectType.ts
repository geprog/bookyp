import { AbstractEntity, Ref } from '~/model/AbstractEntity';
import { Space } from '~/model/Space';

export class MapObjectType extends AbstractEntity {
  name!: string;
  paths!: string[];
  viewBox!: string;
  spaceId!: Ref<Space>;

  constructor(data: Partial<MapObjectType> = {}) {
    super();
    Object.assign(this, data);
  }
}
