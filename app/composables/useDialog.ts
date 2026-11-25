import { ConfirmDialog } from '#components';

export interface DialogParams {
  title: string;
  description: string;
  /** label of the confirm button, `false` hides it */
  confirm?: string | false;
  /** label of the cancel button, `false` hides it */
  cancel?: string | false;
  confirmColor?: 'primary' | 'error';
}

/** opens a confirmation dialog and resolves with the decision of the user */
export function useDialog() {
  const overlay = useOverlay();

  async function openDialog(params: DialogParams): Promise<boolean> {
    const modal = overlay.create(ConfirmDialog, { props: params });
    const instance = modal.open();
    const result = await instance.result;
    return result === true;
  }

  return { openDialog };
}
