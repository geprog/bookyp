import { Application, Model } from '@bookyp/core';
import { AdapterParams, AdapterService } from '@feathersjs/adapter-commons';
import crypto from 'crypto';
import { Client } from 'minio';

import getConfig from '~/config';

class UploadFileService extends AdapterService<Model.FileUpload> {
  app: Application;
  s3: Client;
  bucket: string;
  publicFileUrlPrefix: string;
  publicUploadUrlPrefix?: string;

  constructor(app: Application) {
    super({});
    this.app = app;
    this.s3 = app.get('s3') as Client;

    const config = getConfig();
    const { bucket, publicFileUrlPrefix, publicUploadUrlPrefix } = config.s3;

    if (!bucket) {
      throw new Error('BACKEND_S3_BUCKET not configured');
    }
    this.bucket = bucket;

    if (!publicFileUrlPrefix) {
      throw new Error('BACKEND_S3_PUBLIC_FILE_URL_PREFIX not configured');
    }
    this.publicFileUrlPrefix = publicFileUrlPrefix;

    this.publicUploadUrlPrefix = publicUploadUrlPrefix;
  }

  async create(data: Partial<Model.FileUpload>, params?: AdapterParams): Promise<Model.FileUpload>;
  async create(data: Partial<Model.FileUpload>[], params?: AdapterParams): Promise<Model.FileUpload[]>;
  async create(
    data: Partial<Model.FileUpload> | Partial<Model.FileUpload>[],
  ): Promise<Model.FileUpload | Model.FileUpload[]> {
    const files = Array.isArray(data) ? data : [data];

    const res: Model.FileUpload[] = [];

    for await (const file of files) {
      if (!file.fileName) {
        throw new Error('fileName is required');
      }

      if (!file.spaceId) {
        throw new Error('spaceId is required');
      }

      const randomId = crypto.randomBytes(16).toString('hex');
      const sanitizedFileName = `${file.spaceId}/${randomId}-${file.fileName.replaceAll(/\s/g, '.')}`;

      const expiry = 60 * 15; // 15 minutes
      let uploadUrl = await this.s3.presignedPutObject(this.bucket, sanitizedFileName, expiry);

      // Fix for gitpod environments
      if (this.publicUploadUrlPrefix) {
        uploadUrl = uploadUrl.replace(/^http(s)?:\/\/.+?\//, `${this.publicUploadUrlPrefix}/`);
      }

      res.push({
        fileName: file.fileName,
        spaceId: file.spaceId,
        uploadUrl,
        downloadUrl: `${this.publicFileUrlPrefix}/${sanitizedFileName}`,
      });
    }

    return Array.isArray(data) ? res : res[0];
  }
}

export const name = 'upload-files';

export default (app: Application): void => {
  app.use(name, new UploadFileService(app));
};
