import { Model } from '@bookyp/core';
import { computed, ref } from 'vue';
import { RouteLocationNormalized, Router, useRoute, useRouter } from 'vue-router';

import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import useMapObjects from '~/compositions/space/useMapObjects';
import { useBack } from '~/compositions/useBack';
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
    error: ref(),
    unload: vi.fn(),
  };
  vi.mocked(useGet).mockReturnValueOnce(useGetMock);

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
    error: ref(),
    unload: vi.fn(),
  };
  vi.mocked(useFind).mockReturnValueOnce(useFindMock);

  return {
    data,
    isLoading,
  };
}

export function prepareUseCurrentSpaceMockOnce(space?: Model.Space): void {
  const currentSpace = computed<Model.Space | undefined>(() => space);
  const spaceId = ref('60f53bede6f8313dff7f99e0');

  const useCurrentSpaceMock = {
    currentSpace,
    spaceId,
  };
  vi.mocked(useCurrentSpace).mockReturnValueOnce(useCurrentSpaceMock);
}

export function prepareUseMapObjectsMockOnce(mapObjects: Model.MapObject[]): void {
  const data = computed<Model.MapObject[]>(() => mapObjects);
  const isLoading = ref(false);

  const useMapObjectsMock = {
    data,
    isLoading,
    error: ref(),
    unload: vi.fn(),
  };
  vi.mocked(useMapObjects).mockReturnValueOnce(useMapObjectsMock);
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function prepareUseRouterMockOnce() {
  const replace = vi.fn();
  const push = vi.fn();
  const back = vi.fn();
  const useRouterMock = {
    replace,
    push,
    back,
  } as unknown as Router;

  vi.mocked(useRouter).mockReturnValueOnce(useRouterMock);

  return { replace, push, back };
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function prepareUseRouteMockOnce({ name } = { name: '' }) {
  const useRouterMock = {
    name,
  } as unknown as RouteLocationNormalized;

  vi.mocked(useRoute).mockReturnValueOnce(useRouterMock);

  return { name };
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function prepareUseBackMockOnce() {
  const backMock = vi.fn();
  vi.mocked(useBack).mockReturnValueOnce({
    back: backMock,
  });

  return { backMock };
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function prepareUseFeathersMockOnce() {
  const get = vi.fn();
  const find = vi.fn();
  const create = vi.fn();
  const update = vi.fn();
  const patch = vi.fn();
  const remove = vi.fn();
  const service = vi.fn(() => ({
    get,
    find,
    create,
    patch,
    update,
    remove,
  }));
  const on = vi.fn();
  const off = vi.fn();

  const useFeathersMock = {
    service,
    on,
    off,
  } as unknown as ClientApplication;
  vi.mocked(useFeathers).mockReturnValueOnce(useFeathersMock);

  return { get, find, create, update, patch, remove, service, on, off };
}
