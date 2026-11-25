import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack';
import { FetchError } from 'ofetch';

/** the error codes the api answers with (see `apiError` on the server) */
export type ApiErrorCode
  = | 'booking_overlaps'
    | 'booking_invalid_end_date'
    | 'bookings_not_allowed'
    | 'bookings_limit_reached'
    | 'bookables_limit_reached'
    | 'members_limit_reached'
    | 'space_full'
    | 'already_in_space'
    | 'already_invited'
    | 'invitations_limit_reached'
    | 'payment_customer_required'
    | 'payment_method_required';

export function getApiErrorCode(error: unknown): ApiErrorCode | undefined {
  if (error instanceof FetchError) {
    const code = (error.data as { data?: { code?: string } } | undefined)?.data?.code;
    return code as ApiErrorCode | undefined;
  }
  return undefined;
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof FetchError) {
    const data = error.data as { statusMessage?: string; message?: string } | undefined;
    return data?.statusMessage ?? data?.message ?? error.message;
  }
  return error instanceof Error ? error.message : String(error);
}

/**
 * `$fetch` for the api. After every mutating call all data loaded with `useAsyncData`
 * (and therefore `usePolling`) is refreshed, so the ui reflects the change immediately.
 */
export function useApi() {
  const toast = useAppToast();
  const { t, te } = useI18n();

  function translateError(error: unknown): string {
    const code = getApiErrorCode(error);
    if (code && te(`errors.${code}`)) {
      return t(`errors.${code}`);
    }
    return getApiErrorMessage(error);
  }

  function showError(error: unknown): void {
    console.error(error);
    toast.error(translateError(error));
  }

  async function api<T = unknown>(request: NitroFetchRequest, options: NitroFetchOptions<NitroFetchRequest> = {}): Promise<T> {
    const method = (options.method ?? 'GET').toString().toUpperCase();
    const result = await $fetch<T>(request, options as never);
    if (method !== 'GET') {
      await refreshNuxtData();
    }
    return result as T;
  }

  return { api, showError, translateError };
}
