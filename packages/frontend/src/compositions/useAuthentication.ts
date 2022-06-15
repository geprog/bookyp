import { Model } from '@bookyp/core';
import { FeathersError } from '@feathersjs/errors';
import { getEnvConfig } from '@geprog/vite-plugin-env-config';
import { computed, ref } from 'vue';

import { ability } from '~/compositions/useAuthorization';
import useFeathers, { ClientApplication } from '~/compositions/useFeathers';

export const user = ref<Model.User>();

export const isAuthenticated = computed(() => !!user.value);

let feathers: ClientApplication | undefined;

function init() {
  feathers = useFeathers();

  feathers.on('connect', () => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
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
    if (authentication) {
      ability.value.update(authentication.rules);
    } else {
      ability.value.update([]);
    }
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

  // redirect user to backend to logout from SSO provider
  const backendURL = getEnvConfig('FRONTEND_BACKEND_URL');
  if (!backendURL) {
    throw new Error('Config FRONTEND_BACKEND_URL not set');
  }
  window.location.href = `${backendURL}/authentication/logout`;
}
