import { Model } from '@bookyp/core';
import { mocked } from 'ts-jest/utils';
import { computed, ref } from 'vue';
import { RouteLocationNormalized, Router, useRoute, useRouter } from 'vue-router';

import useCurrentSpace from '~/compositions/space/useCurrentSpace';
import useFeathers, { ClientApplication } from '~/compositions/useFeathers';
import useFind from '~/compositions/useFind';
import useGet from '~/compositions/useGet';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function prepareUseGetMockOnce<T>(initialValue?: T) {
  const data = ref<T | undefined>(initialValue);
  const isLoading = ref(false);

  const useGetMock = {
    data,
    isLoading,
  };
  mocked(useGet, true).mockReturnValueOnce(useGetMock);

  return {
    data,
    isLoading,
  };
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function prepareUseFindMockOnce<T>(initialValue: T[] = []) {
  const data = ref<T[]>(initialValue);
  const isLoading = ref(false);

  const useFindMock = {
    data,
    isLoading,
  };
  mocked(useFind, true).mockReturnValueOnce(useFindMock);

  return {
    data,
    isLoading,
  };
}

export function prepareUseCurrentSpaceMockOnce(space: Model.Space | undefined): void {
  const data = computed<Model.Space | undefined>(() => space);
  const isLoading = ref(false);

  const useCurrentSpaceMock = {
    data,
    isLoading,
  };
  mocked(useCurrentSpace, true).mockReturnValueOnce(useCurrentSpaceMock);
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function prepareUseRouterMockOnce() {
  const replace = jest.fn();
  const push = jest.fn();
  const back = jest.fn();
  const useRouterMock = {
    replace,
    push,
    back,
  } as unknown as Router;

  mocked(useRouter).mockReturnValueOnce(useRouterMock);

  return { replace, push, back };
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function prepareUseRouteMockOnce({ name } = { name: '' }) {
  const useRouterMock = {
    name,
  } as unknown as RouteLocationNormalized;

  mocked(useRoute).mockReturnValueOnce(useRouterMock);

  return { name };
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function prepareUseFeathersMockOnce() {
  const get = jest.fn();
  const find = jest.fn();
  const create = jest.fn();
  const update = jest.fn();
  const patch = jest.fn();
  const remove = jest.fn();
  const service = jest.fn(() => ({
    get,
    find,
    create,
    patch,
    update,
    remove,
  }));
  const on = jest.fn();
  const off = jest.fn();

  const useFeathersMock = {
    service,
    on,
    off,
  } as unknown as ClientApplication;
  mocked(useFeathers).mockReturnValueOnce(useFeathersMock);

  return { get, find, create, update, patch, remove, service, on, off };
}
