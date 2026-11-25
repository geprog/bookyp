import { fileTypeFromBuffer } from 'file-type';

/** only raster formats are accepted: an svg can contain scripts, which would run in the origin of the app */
const allowedImageTypes = new Set(['image/png', 'image/apng', 'image/jpeg', 'image/gif', 'image/webp']);

/**
 * The content type of an uploaded image, detected from its content (the type sent by the client is not trusted).
 * `undefined` when the file is not one of the accepted image formats.
 */
export async function detectImageType(data: Uint8Array): Promise<string | undefined> {
  const type = await fileTypeFromBuffer(data);
  return type && allowedImageTypes.has(type.mime) ? type.mime : undefined;
}
