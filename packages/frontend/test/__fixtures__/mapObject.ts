import { Model } from '@bookyp/core';

export const newMapObject: Omit<Model.MapObject, '_id'> = {
  xPos: 0,
  yPos: 0,
  rotation: 0,
  paths: ['M56.9259 1.12463H17.0648V83.4525H56.9259V1.12463Z', 'M17.0648 26.6198H1.12036V58.4886H17.0648V26.6198Z'],
  type: Model.MapObjectTypes.table,
};

export const mapObjects: Model.MapObject[] = [
  {
    _id: '1',
    xPos: 0,
    yPos: 0,
    rotation: 0,
    paths: ['M56.9259 1.12463H17.0648V83.4525H56.9259V1.12463Z', 'M17.0648 26.6198H1.12036V58.4886H17.0648V26.6198Z'],
    type: Model.MapObjectTypes.table,
  },
  {
    _id: '2',
    xPos: 50,
    yPos: 100,
    rotation: 0,
    paths: ['M56.9259 1.12463H17.0648V83.4525H56.9259V1.12463Z', 'M17.0648 26.6198H1.12036V58.4886H17.0648V26.6198Z'],
    type: Model.MapObjectTypes.table,
  },
];
