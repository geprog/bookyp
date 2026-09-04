import { Application } from '@bookyp/core';
import { Client } from 'minio';

import getConfig from '~/config';

/**
 * Create a presigned url to upload a file to the given object key.
 * @param app The feathers application
 * @param key The s3 object key
 */
export function getUploadUrl(app: Application, key: string): Promise<string> {
  const { bucket } = getConfig().s3;
  if (!bucket) {
    throw new Error('BACKEND_S3_BUCKET not configured');
  }

  const s3 = app.get('s3Presign') as Client;

  const expiry = 60 * 15; // 15 minutes
  return s3.presignedPutObject(bucket, key, expiry);
}

/**
 * Create a presigned url to download the given object key.
 *
 * The signing timestamp is pinned to a fixed window, so the url stays byte-identical
 * for all requests within that window. Without it every response would contain a new
 * signature and the browser would re-download the file on every render.
 * @param app The feathers application
 * @param key The s3 object key
 */
export function getDownloadUrl(app: Application, key: string): Promise<string> {
  const { bucket, downloadUrlWindow } = getConfig().s3;
  if (!bucket) {
    throw new Error('BACKEND_S3_BUCKET not configured');
  }

  const s3 = app.get('s3Presign') as Client;

  const windowMs = downloadUrlWindow * 1000;
  const requestDate = new Date(Math.floor(Date.now() / windowMs) * windowMs);

  // the url stays valid for two windows, so a url handed out at the end of a
  // window is still usable for a while
  return s3.presignedGetObject(
    bucket,
    key,
    downloadUrlWindow * 2,
    {
      'response-content-disposition': 'inline',
      'response-cache-control': `private, max-age=${downloadUrlWindow}`,
    },
    requestDate,
  );
}
