import { config, shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';

import BookableForm from '~/components/space/bookable/BookableForm.vue';
import { sampleBookable } from '$/__fixtures__/bookable';
import { i18n } from '$/__helpers__/i18n';
import { prepareUseBackMockOnce, prepareUseFeathersMockOnce, prepareUseGetMockOnce } from '$/__helpers__/mocks';

import Bookable from './Bookable.vue';

vi.mock('~/compositions/useFeathers');
vi.mock('~/compositions/useGet');
vi.mock('~/compositions/useBack');

describe('Bookable view', () => {
  beforeAll(() => {
    config.renderStubDefaultSlot = true;
  });

  afterAll(() => {
    config.renderStubDefaultSlot = false;
  });

  it('should render correctly', () => {
    // given
    prepareUseFeathersMockOnce();
    prepareUseGetMockOnce(sampleBookable);
    prepareUseBackMockOnce();

    // when
    const wrapper = shallowMount(Bookable, {
      props: {
        bookableId: sampleBookable._id,
      },
      global: {
        plugins: [i18n],
      },
    });

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should pass the bookable to BookableForm', () => {
    // given
    prepareUseFeathersMockOnce();
    prepareUseGetMockOnce(sampleBookable);
    prepareUseBackMockOnce();

    // when
    const wrapper = shallowMount(Bookable, {
      props: {
        bookableId: sampleBookable._id,
      },
      global: {
        plugins: [i18n],
      },
    });

    // then
    expect(wrapper.getComponent(BookableForm).props('bookable')).toStrictEqual(sampleBookable);
  });

  it('should update bookable', async () => {
    expect.assertions(2);

    // given
    const useFeathersMock = prepareUseFeathersMockOnce();
    const { backMock } = prepareUseBackMockOnce();
    prepareUseGetMockOnce(sampleBookable);

    const wrapper = shallowMount(Bookable, {
      props: {
        bookableId: sampleBookable._id,
      },
      global: {
        plugins: [i18n],
      },
    });

    // when
    wrapper.getComponent(BookableForm).vm.$emit('save');
    await nextTick();

    // then
    expect(backMock).toHaveBeenCalledTimes(1);
    expect(useFeathersMock.update).toHaveBeenCalledWith(sampleBookable._id, sampleBookable);
  });
});
