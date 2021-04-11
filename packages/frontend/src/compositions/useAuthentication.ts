import { Model } from '@bookyp/core';
import { FeathersError } from '@feathersjs/errors';
import { computed, ref } from 'vue';

import getFeathers from './useFeathers';

export const user = ref<Model.User>();

export const isAuthenticated = computed(() => !!user.value);

const feathers = getFeathers();

feathers.on('connect', () => {
  void load();
});

feathers.on('disconnect', () => {
  user.value = undefined;
});

export async function load(): Promise<void> {
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
  await feathers.logout();
  user.value = undefined;
}
