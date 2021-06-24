import { Model } from '@bookyp/core';
import { FeathersError } from '@feathersjs/errors';
import { computed, ref } from 'vue';

import { getConfig } from '~/compositions/useAppConfig';
import useFeathers, { ClientApplication } from '~/compositions/useFeathers';

export const user = ref<Model.User>();

export const isAuthenticated = computed(() => !!user.value);

let feathers: ClientApplication | undefined;

function init() {
  feathers = useFeathers();

  feathers.on('connect', () => {
    void reAuthenticate();
  });

  feathers.on('disconnect', () => {
    user.value = undefined;
  });
}

export async function reAuthenticate(): Promise<void> {
  // if not already initialized re-load and try again
  if (!feathers) {
    init();
    await reAuthenticate();
    return;
  }

  try {
    await feathers.reAuthenticate();
    const authentication = await feathers.get('authentication');
    user.value = authentication ? authentication.user : undefined;
  } catch (e) {
    const error = e as FeathersError;

    // remove token if it seems to be invalid
    if (error.code === 401) {
      feathers.authentication.removeAccessToken();
      return;
    }
    throw e;
  }
}

export async function logout(): Promise<void> {
  if (!feathers) {
    throw new Error('Unexpected: Please load authentication first before using logout');
  }

  await feathers.logout();
  user.value = undefined;
  const auth_url = getConfig('SSO_AUTH_URL') || '';
  const auth_logout = getConfig('SSO_AUTH_LOGOUT_ENDPOINT') || '';
  window.location.replace(`https://${auth_url}${auth_logout}`);
}
