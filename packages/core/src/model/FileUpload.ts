import { Ref } from '~/model/AbstractEntity';
import { Space } from '~/model/Space';

export type FileUpload = {
  fileName: string;
  spaceId: Ref<Space>;
  uploadUrl?: string;
  fileKey?: string; // s3 object key the file is uploaded to, this is what gets persisted
  downloadUrl?: string; // short-lived signed download url, only meant for an immediate preview
};
