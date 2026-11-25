import { z } from 'zod';

export const idSchema = z.string().refine(value => isValidId(value), 'Invalid id');

export const isoDateSchema = z
  .string()
  .refine(value => !Number.isNaN(Date.parse(value)), 'Invalid date')
  .transform(value => new Date(value));

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email();

export const coordinatesSchema = z.object({ lng: z.number(), lat: z.number() });

/** Throws a 400 with the validation issues when the data does not match the schema. */
export function parseOrThrow<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: { issues: result.error.issues },
    });
  }
  return result.data;
}

export async function readBody$<T>(event: Parameters<typeof readBody>[0], schema: z.ZodType<T>): Promise<T> {
  return parseOrThrow(schema, await readBody(event));
}

export function getQuery$<T>(event: Parameters<typeof getQuery>[0], schema: z.ZodType<T>): T {
  return parseOrThrow(schema, getQuery(event));
}

/** Errors with a stable `code` the client can translate. */
export function apiError(statusCode: number, code: string, message?: string): never {
  throw createError({ statusCode, statusMessage: message ?? code, data: { code } });
}
