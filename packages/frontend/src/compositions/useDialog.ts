import { createPromiseDialog } from 'vue-promise-dialogs';

import Dialog from '~/components/Dialog.vue';

export interface DialogParams {
  label: string;
  description: string;
  confirm?: string;
  cancel?: string;
}

export function openDialog(params: DialogParams): Promise<boolean> {
  return createPromiseDialog<DialogParams, boolean>(Dialog)(params);
}
