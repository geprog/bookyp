import type { DbMapObjectType } from '../../../utils/dbTypes';
import { z } from 'zod';

const bodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  paths: z.array(z.string().max(100000)).min(1).max(500),
  bgPaths: z.array(z.string().max(100000)).max(500).optional(),
  viewBox: z.string().trim().max(200),
});

export default defineEventHandler(async (event) => {
  const { space } = await requireSpaceAdmin(event, getRouterParam(event, 'id'));
  const body = await readBody$(event, bodySchema);
  const { mapObjectTypes } = await useCollections();
  const doc = { ...body, spaceId: space._id.toString() } as DbMapObjectType;
  const result = await mapObjectTypes.insertOne(doc);
  setResponseStatus(event, 201);
  return serialize({ ...doc, _id: result.insertedId });
});
