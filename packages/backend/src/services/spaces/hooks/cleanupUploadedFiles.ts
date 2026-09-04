import { Application, Service } from '@bookyp/core';
import { HookContext } from '@feathersjs/feathers';
import { Client } from 'minio';

import getConfig from '~/config';

/**
 * Get all files for a space and delete them from S3 if they are
 * not referenced in the space anymore.
 * Supports multiple updated projects as well.
 * @param context The hook context
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function cleanupUploadedFiles(context: HookContext<Application, Service.ServiceTypes['spaces']>) {
  if (context.type !== 'after') {
    throw new Error("The 'cleanupUploadedFiles' hook should only be used as an 'after' hook.");
  }

  if (!context.data || context.method === 'get' || context.method === 'find') {
    return;
  }

  const { bucket } = getConfig().s3;
  if (!bucket) {
    throw new Error('BACKEND_S3_BUCKET not configured');
  }
  const s3 = context.app.get('s3') as Client;

  const spaces = Array.isArray(context.data) ? context.data : [context.data];
  for await (const space of spaces) {
    const spaceId = space._id;
    if (!spaceId) {
      continue;
    }

    // a partial update that does not touch the image must not delete it
    if (!('imageKey' in space)) {
      continue;
    }

    const { imageKey } = space;
    const objectsStream = s3.listObjectsV2(bucket, `${spaceId}/`, true);
    objectsStream.on('data', (obj) => {
      if (imageKey !== obj.name) {
        void s3.removeObject(bucket, obj.name);
      }
    });

    await new Promise((resolve, reject) => {
      objectsStream.on('end', resolve);
      objectsStream.on('error', reject);
    });
  }
}
