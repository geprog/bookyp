import { z } from 'zod';
import { spacePlanNames } from '#shared/utils/plans';

export const bookingsAndRequestsSchema = z.enum(['bookings', 'requests', 'both', 'only_info']);

const optionalText = (max: number) => z.string().trim().max(max).optional();

/** the fields an admin is allowed to change on a space */
export const spaceUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: optionalText(5000),
  address: optionalText(1000),
  email: z.union([emailSchema, z.literal('')]).optional(),
  phone: optionalText(100),
  website: optionalText(500),
  coordinates: coordinatesSchema.nullable().optional(),
  isPublic: z.boolean().optional(),
  bookingsAndRequests: bookingsAndRequestsSchema.optional(),
  floorPlan: z.array(z.string().max(100000)).max(5000).optional(),
});

/** the fields only a super admin is allowed to change */
export const spaceSuperAdminUpdateSchema = z.object({
  plan: z.enum(spacePlanNames as [string, ...string[]]).optional(),
  activeUntil: z.union([isoDateSchema, z.null()]).optional(),
});

export const spaceCreateSchema = spaceUpdateSchema.extend({
  name: z.string().trim().min(1).max(200),
});
