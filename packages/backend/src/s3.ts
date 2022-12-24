import { Application } from '@bookyp/core';
import { Client } from 'minio';

import getConfig from '~/config';

export default function (app: Application): void {
  const config = getConfig();

  if (!config.s3.endpoint) {
    throw new Error('BACKEND_S3_ENDPOINT not configured');
  }

  if (!config.s3.accessKey || !config.s3.secretKey) {
    throw new Error('BACKEND_S3_ACCESS_KEY or BACKEND_S3_SECRET_KEY not configured');
  }

  const minioClient = new Client({
    endPoint: config.s3.endpoint,
    port: config.s3.port,
    useSSL: config.s3.useSSL,
    accessKey: config.s3.accessKey,
    secretKey: config.s3.secretKey,
  });

  void (async () => {
    if (!config.s3.bucket) {
      throw new Error('BACKEND_S3_BUCKET not configured');
    }

    if (!(await minioClient.bucketExists(config.s3.bucket))) {
      await minioClient.makeBucket(config.s3.bucket, '');
    }
  })();

  app.set('s3', minioClient);
}
