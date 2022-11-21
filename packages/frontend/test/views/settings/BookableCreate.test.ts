import { config, shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';

import BookableForm from '~/components/bookables/BookableForm.vue';
import BookableCreate from '~/views/settings/BookableCreate.vue';
import { sampleBookable } from '$/__fixtures__/bookable';
import { i18n } from '$/__helpers__/i18n';
import {
  prepareUseCurrentSpaceMockOnce,
  prepareUseFeathersMockOnce,
  prepareUseRouterMockOnce,
} from '$/__helpers__/mocks';

vi.mock('~/compositions/useFeathers');
vi.mock('~/compositions/space/useCurrentSpace');
vi.mock('vue-router', () => ({
  useRouter: vi.fn(),
}));

describe('BookableCreate view', () => {
  beforeAll(() => {
    config.renderStubDefaultSlot = true;
  });

  afterAll(() => {
    config.renderStubDefaultSlot = false;
  });

  it('should render correctly', () => {
    // given
    prepareUseFeathersMockOnce();
    prepareUseRouterMockOnce();
    prepareUseCurrentSpaceMockOnce();

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
    const useRouterMock = prepareUseRouterMockOnce();
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
    expect(useRouterMock.back).toHaveBeenCalledTimes(1);
    expect(useFeathersMock.create).toHaveBeenCalledWith(sampleBookable);
  });
});
