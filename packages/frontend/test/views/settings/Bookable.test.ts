import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';

import Bookable from '~/views/settings/Bookable.vue';
import { sampleBookable } from '$/__fixtures__/bookable';
import { prepareUseFeathersMockOnce, prepareUseGetMockOnce, prepareUseRouterMockOnce } from '$/__helpers__/mocks';

jest.mock('~/compositions/useFeathers');
jest.mock('~/compositions/useGet');
jest.mock('vue-i18n');
jest.mock('vue-router', () => ({
  useRouter: jest.fn(),
}));

describe('Bookable view', () => {
  it('should render correctly', () => {
    // given
    prepareUseFeathersMockOnce();
    prepareUseRouterMockOnce();
    prepareUseGetMockOnce(sampleBookable);

    // when
    const wrapper = shallowMount(Bookable, {
      props: {
        bookableId: sampleBookable._id,
      },
    });

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should pass the bookable to BookableForm', () => {
    // given
    prepareUseFeathersMockOnce();
    prepareUseRouterMockOnce();
    prepareUseGetMockOnce(sampleBookable);

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
    const useFeathersMock = prepareUseFeathersMockOnce();
    const useRouterMock = prepareUseRouterMockOnce();
    prepareUseGetMockOnce(sampleBookable);

    const wrapper = shallowMount(Bookable, {
      props: {
        bookableId: sampleBookable._id,
      },
    });

    // when
    wrapper.getComponent('[data-test=bookable-form]').vm.$emit('save');
    await nextTick();

    // then
    expect(useRouterMock.replace).toHaveBeenCalledTimes(1);
    expect(useFeathersMock.update).toHaveBeenCalledWith(sampleBookable._id, sampleBookable);
  });
});
