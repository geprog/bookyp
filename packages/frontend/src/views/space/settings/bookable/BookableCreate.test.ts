import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';

import BookableForm from '~/components/space/bookable/BookableForm.vue';
import { sampleBookable } from '$/__fixtures__/bookable';
import { i18n } from '$/__helpers__/i18n';
import {
  prepareUseBackMockOnce,
  prepareUseCurrentSpaceMockOnce,
  prepareUseFeathersMockOnce,
} from '$/__helpers__/mocks';

import BookableCreate from './BookableCreate.vue';

vi.mock('~/compositions/useFeathers');
vi.mock('~/compositions/space/useCurrentSpace');
vi.mock('~/compositions/useBack');

describe('BookableCreate view', () => {
  it('should render correctly', () => {
    // given
    prepareUseFeathersMockOnce();
    prepareUseCurrentSpaceMockOnce();
    prepareUseBackMockOnce();

    // when
    const wrapper = shallowMount(BookableCreate, {
      global: {
        plugins: [i18n],
      },
    });

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should create bookable', async () => {
    expect.assertions(2);

    // given
    const useFeathersMock = prepareUseFeathersMockOnce();
    const { backMock } = prepareUseBackMockOnce();
    prepareUseCurrentSpaceMockOnce();
    const wrapper = shallowMount(BookableCreate, {
      global: {
        plugins: [i18n],
      },
    });

    await wrapper.getComponent(BookableForm).setValue(sampleBookable, 'bookable');

    // when
    wrapper.getComponent(BookableForm).vm.$emit('save');
    await nextTick();

    // then
    expect(backMock).toHaveBeenCalledTimes(1);
    expect(useFeathersMock.create).toHaveBeenCalledWith(sampleBookable);
  });
});
