import type { AnyBulkWriteOperation } from 'mongodb';
import type { DbMapObject } from '../../../utils/dbTypes';
import { z } from 'zod';

const pathsSchema = z.array(z.string().max(100000)).max(500);

const mapObjectSchema = z.object({
  /** the id of an existing map object, omitted for new ones */
  _id: idSchema.optional(),
  xPos: z.number(),
  yPos: z.number(),
  rotation: z.number(),
  paths: pathsSchema,
  bgPaths: pathsSchema.optional(),
  type: z.string().max(200),
  link: z
    .discriminatedUnion('type', [
      // checked below: v1 stored the link without validation, an unchanged legacy link must not block the save
      z.object({ type: z.literal('url'), url: z.string().max(2000) }),
      z.object({ type: z.literal('bookable'), bookable: idSchema }),
    ])
    .nullable()
    .optional(),
});

const bodySchema = z.object({ mapObjects: z.array(mapObjectSchema).max(2000) });

/**
 * Replaces the map objects of a space with the given list: new objects are created,
 * existing ones updated and the ones missing from the list are deleted.
 */
export default defineEventHandler(async (event) => {
  const { space } = await requireSpaceAdmin(event, getRouterParam(event, 'id'));
  const { mapObjects: input } = await readBody$(event, bodySchema);
  const spaceId = space._id.toString();
  const { mapObjects, bookables } = await useCollections();

  // links may only point at bookables of this space
  const linkedBookableIds = input.flatMap(m => (m.link?.type === 'bookable' ? [m.link.bookable] : []));
  if (linkedBookableIds.length > 0) {
    const known = await bookables.countDocuments({ _id: { $in: linkedBookableIds.map(id => toObjectId(id)) }, space: spaceId });
    if (known !== new Set(linkedBookableIds).size) {
      throw createError({ statusCode: 400, statusMessage: 'Map objects may only link to bookables of the same space' });
    }
  }

  const existing = await mapObjects.find({ space: spaceId }, { projection: { _id: 1, link: 1 } }).toArray();
  const existingIds = new Set(existing.map(doc => doc._id.toString()));
  const storedUrls = new Map(existing.flatMap(doc => (doc.link?.type === 'url' ? [[doc._id.toString(), doc.link.url] as const] : [])));

  // new or changed website links must be absolute http(s) urls
  for (const { _id, link } of input) {
    if (link?.type === 'url' && !parseWebUrl(link.url) && !(_id && storedUrls.get(_id) === link.url)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid url' });
    }
  }

  const keptIds = new Set<string>();
  const operations: AnyBulkWriteOperation<DbMapObject>[] = [];

  for (const { _id, link, ...data } of input) {
    const doc = { ...data, space: spaceId, ...(link ? { link } : {}) };
    if (_id && existingIds.has(_id)) {
      keptIds.add(_id);
      operations.push({ replaceOne: { filter: { _id: toObjectId(_id) }, replacement: doc as DbMapObject } });
    }
    else {
      operations.push({ insertOne: { document: doc as DbMapObject } });
    }
  }
  const toDelete = [...existingIds].filter(id => !keptIds.has(id));
  if (toDelete.length > 0) {
    operations.push({ deleteMany: { filter: { _id: { $in: toDelete.map(id => toObjectId(id)) } } } });
  }
  if (operations.length > 0) {
    await mapObjects.bulkWrite(operations);
  }

  const docs = await mapObjects.find({ space: spaceId }).toArray();
  return serializeAll(docs);
});
