import { useToast } from 'vue-toastification';

type Toast = ReturnType<typeof useToast>;

/** the toasts of v1: success (green), info (gray) and error (red) messages at the top right */
export function useAppToast() {
  const toast = useToast();

  return {
    success: (message: string, options?: Parameters<Toast['success']>[1]) => toast.success(message, options),
    info: (message: string, options?: Parameters<Toast['info']>[1]) => toast.info(message, options),
    error: (message: string, options?: Parameters<Toast['error']>[1]) => toast.error(message, options),
    dismiss: (id: Parameters<Toast['dismiss']>[0]) => toast.dismiss(id),
  };
}
