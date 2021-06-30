import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';

import BookableCreate from '~/views/settings/BookableCreate.vue';
import { sampleBookable } from '$/__fixtures__/bookable';
import { prepareUseFeathersMockOnce, prepareUseRouterMockOnce } from '$/__helpers__/mocks';

jest.mock('~/compositions/useFeathers');
jest.mock('vue-i18n');
jest.mock('vue-router', () => ({
  useRouter: jest.fn(),
}));

describe('BookableCreate view', () => {
  it('should render correctly', () => {
    // given
    prepareUseFeathersMockOnce();
    prepareUseRouterMockOnce();

    // when
    const wrapper = shallowMount(BookableCreate);

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should create bookable', async () => {
    expect.assertions(2);

    // given
    const useFeathersMock = prepareUseFeathersMockOnce();
    const useRouterMock = prepareUseRouterMockOnce();
    const wrapper = shallowMount(BookableCreate);

    await wrapper.getComponent('[data-test=bookable-form]').setValue(sampleBookable, 'bookable');

    // when
    wrapper.getComponent('[data-test=bookable-form]').vm.$emit('save');
    await nextTick();

    // then
    expect(useRouterMock.replace).toHaveBeenCalledTimes(1);
    expect(useFeathersMock.create).toHaveBeenCalledWith(sampleBookable);
  });
});
