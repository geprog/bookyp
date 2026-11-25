/** Streams the image of a space. The `v` query parameter only exists for cache busting. */
export default defineEventHandler(async (event) => {
  const { space } = await requireSpaceAccess(event, getRouterParam(event, 'id'), 'public');
  if (!space.imageKey) {
    throw createError({ statusCode: 404, statusMessage: 'Space has no image' });
  }
  const { stream, contentType, size } = await getFile(space.imageKey);
  setHeader(event, 'Content-Type', contentType);
  setHeader(event, 'Content-Length', size);
  // images uploaded before the type was checked (or by v1) can be anything, e.g. an svg with scripts:
  // opened directly the file must not run scripts in the origin of the app (it still renders in an <img>)
  setHeader(event, 'X-Content-Type-Options', 'nosniff');
  setHeader(event, 'Content-Security-Policy', 'default-src \'none\'; style-src \'unsafe-inline\'; sandbox');
  setHeader(event, 'Cache-Control', 'private, max-age=31536000, immutable');
  return sendStream(event, stream);
});
