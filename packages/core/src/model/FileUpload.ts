import { Ref } from '~/model/AbstractEntity';
import { Space } from '~/model/Space';

export type FileUpload = {
  fileName: string;
  spaceId: Ref<Space>;
  uploadUrl?: string;
  downloadUrl?: string;
};
