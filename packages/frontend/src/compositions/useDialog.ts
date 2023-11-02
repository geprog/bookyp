import { createPromiseDialog } from 'vue-promise-dialogs';

import Dialog from '~/components/Dialog.vue';

export interface DialogParams {
  label: string;
  description: string;
  confirm?: string | boolean;
  cancel?: string | boolean;
}

export function openDialog(params: DialogParams): Promise<boolean> {
  return createPromiseDialog<DialogParams, boolean>(Dialog)(params);
}
