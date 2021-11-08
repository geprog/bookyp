import { config, shallowMount } from '@vue/test-utils';
import { mocked } from 'ts-jest/utils';
import { nextTick, ref } from 'vue';

import getMapObjects from '~/compositions/space/useMapObjects';
import MapObjectsEdit from '~/views/settings/space/MapObjectsEdit.vue';
import { sampleMapObject, sampleMapObjects } from '$/__fixtures__/mapObject';
import { prepareUseFeathersMockOnce, prepareUseRouterMockOnce } from '$/__helpers__/mocks';

jest.mock('~/compositions/useFind');

jest.mock('~/compositions/useAuthentication');
jest.mock('~/compositions/useFeathers');
jest.mock('~/compositions/space/useMapObjects');
jest.mock('vue-router');

function prepareGetMapObjectsOnce() {
  const getMapObjectsMock = jest.fn();
  mocked(getMapObjects).mockReturnValue({ data: ref(sampleMapObjects), isLoading: ref(false) });
  return { getMapObjectsMock };
}

const replaceMock = jest.fn();
jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => ({ name: 'settings-space' })),
  useRouter: jest.fn(() => ({
    replace: replaceMock,
    push: jest.fn(),
  })),
}));
jest.mock('vue-i18n');

describe('MapObjectsEdit component', () => {
  beforeAll(() => {
    config.renderStubDefaultSlot = true;
  });

  afterAll(() => {
    config.renderStubDefaultSlot = false;
  });
  it('should render correctly', () => {
    expect.hasAssertions();
    // given
    prepareUseFeathersMockOnce();
    prepareGetMapObjectsOnce();

    // when
    const wrapper = shallowMount(MapObjectsEdit, {
      props: {
        saveTrigger: false,
        abortTrigger: false,
      },
    });
    // then
    expect(wrapper.html()).toMatchSnapshot();
  });

  describe('"viewing" mode', () => {
    it('should start in "viewing" mode', () => {
      expect.assertions(3);
      // given
      prepareUseFeathersMockOnce();
      prepareGetMapObjectsOnce();

      // when
      const wrapper = shallowMount(MapObjectsEdit, {
        props: {
          saveTrigger: false,
          abortTrigger: false,
        },
      });

      // then
      expect(wrapper.vm.isSelected).toBe(false);
      expect(wrapper.find('[data-test=save-button]').exists()).toBe(false);
      expect(wrapper.find('[data-test=delete-button]').exists()).toBe(false);
    });
  });

  describe('"editing" mode', () => {
    it('should select map-object and be in "editing" mode when accessing with map-object-id url parameter', () => {
      expect.assertions(2);
      // given
      prepareGetMapObjectsOnce();
      prepareUseFeathersMockOnce();
      // when
      const wrapper = shallowMount(MapObjectsEdit, {
        props: {
          saveTrigger: false,
          abortTrigger: false,
          selectedMapObjectId: sampleMapObject._id,
        },
      });

      // then
      expect(wrapper.vm.isSelected).toBe(true);
      expect(wrapper.find('[data-test=delete-button]').exists()).toBe(true);
    });
  });
  it('should save sampleMapObject and emit change-happened when save trigger changes', async () => {
    expect.assertions(1);
    // given

    const wrapper = shallowMount(MapObjectsEdit, {
      props: {
        saveTrigger: false,
        abortTrigger: false,
      },
    });

    // when
    await wrapper.setProps({ saveTrigger: true });
    await nextTick();

    // then
    expect(wrapper.emitted('change-happened')).toStrictEqual([[false], [false]]);
  });
  it('should set sampleNewMapObject to null and emit change-happened when abort trigger changes', async () => {
    expect.assertions(1);
    // given

    const wrapper = shallowMount(MapObjectsEdit, {
      props: {
        saveTrigger: false,
        abortTrigger: false,
      },
    });

    // when
    await wrapper.setProps({ abortTrigger: true });
    await nextTick();

    // then
    expect(wrapper.emitted('change-happened')).toStrictEqual([[false], [false], [false]]);
  });
  it('should open map-object details when clicking on edit', async () => {
    expect.assertions(1);
    // given
    prepareGetMapObjectsOnce();
    const { push } = prepareUseRouterMockOnce();

    const wrapper = shallowMount(MapObjectsEdit, {
      props: {
        saveTrigger: false,
        abortTrigger: false,
        selectedMapObjectId: sampleMapObject._id,
      },
    });

    // when
    await wrapper.find('[data-test=edit-button]').trigger('click');

    // then
    expect(push).toHaveBeenCalledWith({
      name: 'settings-map-object',
      params: { mapObjectId: sampleMapObject._id },
    });
  });
});
