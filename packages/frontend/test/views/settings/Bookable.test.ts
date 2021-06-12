import { shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';
import { mocked } from 'ts-jest/utils';
import { nextTick, ref } from 'vue';
import { Router, useRouter } from 'vue-router';

import useFeathers, { ClientApplication } from '~/compositions/useFeathers';
import useGet from '~/compositions/useGet';
import Bookable from '~/views/settings/Bookable.vue';
import { sampleBookable } from '$/__fixtures__/bookable';

jest.mock('~/compositions/useFeathers');
jest.mock('~/compositions/useGet');
jest.mock('vue-i18n');
jest.mock('vue-router', () => ({
  useRouter: jest.fn(() => ({
    replace: jest.fn(),
    push: jest.fn(),
  })),
}));

describe('Bookable view', () => {
  it('should render correctly', () => {
    // given
    const useFeathersMock = {
      service: () => ({
        get: jest.fn(),
      }),
    } as unknown as ClientApplication;
    mocked(useFeathers, true).mockReturnValue(useFeathersMock);

    const useGetMock = {
      data: ref(sampleBookable),
      isLoading: ref(false),
    };
    mocked(useGet, true).mockReturnValue(useGetMock);

    // when
    const wrapper = shallowMount(Bookable, {
      props: {
        bookableId: sampleBookable._id,
      },
    });

    // then
    expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
  });

  it('should pass the bookable to BookableForm', () => {
    // given
    const useFeathersMock = {
      service: () => ({
        get: jest.fn(),
      }),
    } as unknown as ClientApplication;
    mocked(useFeathers, true).mockReturnValue(useFeathersMock);

    const useGetMock = {
      data: ref(sampleBookable),
      isLoading: ref(false),
    };
    mocked(useGet, true).mockReturnValue(useGetMock);

    // when
    const wrapper = shallowMount(Bookable, {
      props: {
        bookableId: sampleBookable._id,
      },
    });

    // then
    expect(wrapper.getComponent('[data-test=bookable-form]').props('bookable')).toStrictEqual(sampleBookable);
  });

  it('should update bookable', async () => {
    expect.assertions(2);

    // given
    const feathersUpdate = jest.fn();
    const useFeathersMock = {
      service: () => ({
        get: jest.fn(),
        update: feathersUpdate,
      }),
    } as unknown as ClientApplication;
    mocked(useFeathers, true).mockReturnValue(useFeathersMock);

    const useGetMock = {
      data: ref(sampleBookable),
      isLoading: ref(false),
    };
    mocked(useGet, true).mockReturnValue(useGetMock);

    const replaceMock = jest.fn();
    const useRouterMock = {
      replace: replaceMock,
    } as unknown as Router;
    mocked(useRouter).mockReturnValue(useRouterMock);

    const wrapper = shallowMount(Bookable, {
      props: {
        bookableId: sampleBookable._id,
      },
    });

    // when
    wrapper.getComponent('[data-test=bookable-form]').vm.$emit('save');
    await nextTick();

    // then
    expect(replaceMock).toHaveBeenCalledTimes(1);
    expect(feathersUpdate).toHaveBeenCalledWith(sampleBookable._id, sampleBookable);
  });
});
