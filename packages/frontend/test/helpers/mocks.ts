import { mocked } from 'ts-jest/utils';
import { ref } from 'vue';
import { Router, useRouter } from 'vue-router';

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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function prepareUseRouterMockOnce() {
  const replaceMock = jest.fn();
  const pushMock = jest.fn();
  const backMock = jest.fn();
  const useRouterMock = ({
    replace: replaceMock,
    push: pushMock,
    back: backMock,
  } as unknown) as Router;

  mocked(useRouter).mockReturnValueOnce(useRouterMock);

  return { replaceMock, pushMock, backMock };
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function prepareUseFeathersMockOnce() {
  const getMock = jest.fn();
  const findMock = jest.fn();
  const createMock = jest.fn();
  const updateMock = jest.fn();
  const patchMock = jest.fn();
  const deleteMock = jest.fn();
  const serviceMock = jest.fn(() => ({
    get: getMock,
    find: findMock,
    create: createMock,
    patch: patchMock,
    update: updateMock,
    delete: deleteMock,
  }));
  const onMock = jest.fn();
  const offMock = jest.fn();

  const useFeathersMock = ({
    service: serviceMock,
    on: onMock,
    off: offMock,
  } as unknown) as ClientApplication;
  mocked(useFeathers, true).mockReturnValue(useFeathersMock);

  return { getMock, findMock, createMock, updateMock, patchMock, deleteMock, serviceMock, onMock, offMock };
}
