import { randomBytes } from 'node:crypto';

const maxImageSize = 10 * 1024 * 1024;
/** room for the boundaries and part headers of the multipart body */
const multipartOverhead = 64 * 1024;

/** Uploads a new image for the space and removes the old one. */
export default defineEventHandler(async (event) => {
  const { user, space } = await requireSpaceAdmin(event, getRouterParam(event, 'id'));
  // the body is read into memory, so its size is checked before reading it (a body without a length is not accepted)
  const contentLength = Number(getRequestHeader(event, 'content-length'));
  if (!Number.isFinite(contentLength)) {
    throw createError({ statusCode: 411, statusMessage: 'Length required' });
  }
  if (contentLength > maxImageSize + multipartOverhead) {
    throw createError({ statusCode: 413, statusMessage: 'The image must be smaller than 10 MB' });
  }
  const parts = await readMultipartFormData(event);
  const file = parts?.find(part => part.name === 'file' && part.filename);
  // the type is detected from the content, the one sent by the client could be anything (e.g. an svg with scripts)
  const contentType = file && await detectImageType(file.data);
  if (!file || !contentType) {
    throw createError({ statusCode: 400, statusMessage: 'Please upload a PNG, JPEG, GIF or WebP image' });
  }
  if (file.data.length > maxImageSize) {
    throw createError({ statusCode: 413, statusMessage: 'The image must be smaller than 10 MB' });
  }

  const spaceId = space._id.toString();
  const fileName = (file.filename ?? 'image').replace(/[^\w.-]+/g, '.');
  const imageKey = `${spaceId}/${randomBytes(16).toString('hex')}-${fileName}`;
  await putFile(imageKey, file.data, contentType);

  const { spaces } = await useCollections();
  const updated = await spaces.findOneAndUpdate({ _id: space._id }, { $set: { imageKey } }, { returnDocument: 'after' });
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Space not found' });
  }
  // files are stored below the id of their space, drop everything that is not referenced anymore
  await removeFiles(`${spaceId}/`, imageKey).catch(error => console.error('🔥 Could not clean up old space images', error));

  await populateMembers([updated]);
  return serializeSpace(updated, user, 'admin');
});
