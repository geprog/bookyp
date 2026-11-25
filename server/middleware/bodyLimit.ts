/** Rejects request bodies that are larger than `maxBodySize` before any route reads them. */
export default defineEventHandler((event) => {
  const status = bodyLimitStatus(event.method, event.path, {
    contentLength: getRequestHeader(event, 'content-length'),
    transferEncoding: getRequestHeader(event, 'transfer-encoding'),
  });
  if (status === 413) {
    throw createError({ statusCode: 413, statusMessage: 'Request body too large' });
  }
  if (status === 411) {
    throw createError({ statusCode: 411, statusMessage: 'Length required' });
  }
});
