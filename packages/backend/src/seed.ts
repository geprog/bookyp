import { Application, Model } from '@bookyp/core';

export default async function seed(app: Application): Promise<void> {
  const { length } = (await app.service('spaces').find({})) as Model.Space[];
  if (length === 0) {
    await app.service('spaces').create({
      floorPlan: [
        'M288 325H30.2315V226.738H1V1H288V325Z',
        'M1 1.96375V44.2787H43.5143C43.4181 20.8928 24.4229 1.96428 1 1.96375Z',
      ],
    });
  }
  // seed bookables
  const bookablesRes = (await app.service('bookables').find({})) as Model.Bookable[];
  if (bookablesRes.length === 0) {
    await app.service('bookables').create({
      name: 'Desk 1',
      description: 'chef desk',
    });
    await app.service('bookables').create({
      name: 'Desk 2',
      description: 'pencil desk',
    });
  }
  const mapObjectsRes = (await app.service('mapObjects').find({})) as Model.MapObject[];
  if (mapObjectsRes.length === 0) {
    await app.service('mapObjects').create({
      xPos: 70,
      yPos: 0,
      rotation: 0,
      paths: [
        'M5.60744 79.7345C3.25936 79.7345 1.35559 77.8319 1.35559 75.4853V5.90494C1.35559 3.55833 3.25936 1.65576 5.60744 1.65576H39.0908C41.4389 1.65576 43.3426 3.55833 43.3426 5.90494V75.4853C43.3426 77.8319 41.4389 79.7345 39.0908 79.7345H5.60744Z',
        'M38.0278 6.96729H1.35559V74.423H38.0278V6.96729Z',
        'M38.0279 6.96729H29.5242V40.4296H38.0279V6.96729Z',
        'M38.0279 40.4296H29.5242V74.423H38.0279V40.4296Z',
      ],
      type: Model.MapObjectTypes.table,
    });
    // get created bookable
    const bookables = (await app.service('bookables').find({})) as Model.Bookable[];
    await app.service('mapObjects').create({
      xPos: 30,
      yPos: 90,
      rotation: 0,
      paths: ['M56.9259 1.12463H17.0648V83.4525H56.9259V1.12463Z', 'M17.0648 26.6198H1.12036V58.4886H17.0648V26.6198Z'],
      type: Model.MapObjectTypes.table,
      bookable: bookables[0]._id,
    });
  }
}
