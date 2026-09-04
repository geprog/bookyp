import { Application, Model } from '@bookyp/core';
import { AdapterParams, AdapterService } from '@feathersjs/adapter-commons';
import crypto from 'crypto';

import { getDownloadUrl, getUploadUrl } from '~/lib/fileUrls';

class UploadFileService extends AdapterService<Model.FileUpload> {
  app: Application;

  constructor(app: Application) {
    super({});
    this.app = app;
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
      const fileKey = `${file.spaceId}/${randomId}-${file.fileName.replaceAll(/\s/g, '.')}`;

      res.push({
        fileName: file.fileName,
        spaceId: file.spaceId,
        fileKey,
        uploadUrl: await getUploadUrl(this.app, fileKey),
        downloadUrl: await getDownloadUrl(this.app, fileKey),
      });
    }

    return Array.isArray(data) ? res : res[0];
  }
}

export const name = 'upload-files';

export default (app: Application): void => {
  app.use(name, new UploadFileService(app));
};
