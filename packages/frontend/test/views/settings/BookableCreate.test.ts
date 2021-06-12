import { shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';
import { mocked } from 'ts-jest/utils';
import { nextTick } from 'vue';
import { Router, useRouter } from 'vue-router';

import useFeathers, { ClientApplication } from '~/compositions/useFeathers';
import BookableCreate from '~/views/settings/BookableCreate.vue';
import { sampleBookable } from '$/__fixtures__/bookable';

jest.mock('~/compositions/useFeathers');
jest.mock('vue-i18n');
jest.mock('vue-router', () => ({
  useRouter: jest.fn(() => ({
    replace: jest.fn(),
    push: jest.fn(),
  })),
}));

describe('BookableCreate view', () => {
  it('should render correctly', () => {
    // given
    const useFeathersMock = {
      service: () => ({
        get: jest.fn(),
      }),
    } as unknown as ClientApplication;
    mocked(useFeathers, true).mockReturnValue(useFeathersMock);

    const replaceMock = jest.fn();
    const useRouterMock = {
      replace: replaceMock,
    } as unknown as Router;
    mocked(useRouter).mockReturnValue(useRouterMock);

    // when
    const wrapper = shallowMount(BookableCreate);

    // then
    expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
  });

  it('should create bookable', async () => {
    expect.assertions(2);

    // given
    const feathersCreate = jest.fn();
    const useFeathersMock = {
      service: () => ({
        get: jest.fn(),
        create: feathersCreate,
      }),
    } as unknown as ClientApplication;
    mocked(useFeathers, true).mockReturnValue(useFeathersMock);

    const replaceMock = jest.fn();
    const useRouterMock = {
      replace: replaceMock,
    } as unknown as Router;
    mocked(useRouter).mockReturnValue(useRouterMock);

    const wrapper = shallowMount(BookableCreate, {});

    await wrapper.getComponent('[data-test=bookable-form]').setValue(sampleBookable, 'bookable');

    // when
    wrapper.getComponent('[data-test=bookable-form]').vm.$emit('save');
    await nextTick();

    // then
    expect(replaceMock).toHaveBeenCalledTimes(1);
    expect(feathersCreate).toHaveBeenCalledWith(sampleBookable);
  });
});
