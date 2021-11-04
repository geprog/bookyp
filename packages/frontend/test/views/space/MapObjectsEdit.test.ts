import { Model } from '@bookyp/core';
import { config, shallowMount } from '@vue/test-utils';
import { mocked } from 'ts-jest/utils';
import { nextTick, ref } from 'vue';

import MapObjects from '~/components/space/MapObjects.vue';
import SpaceMap from '~/components/space/SpaceMap.vue';
import useNewMapObject from '~/compositions/space/useNewMapObject';
import MapObjectsEdit from '~/views/settings/space/MapObjectsEdit.vue';
import { sampleMapObject, sampleNewMapObject } from '$/__fixtures__/mapObject';
import { prepareUseFeathersMockOnce, prepareUseRouterMockOnce } from '$/__helpers__/mocks';

jest.mock('~/compositions/useFind');

jest.mock('~/compositions/useAuthentication');
jest.mock('~/compositions/useFeathers');
jest.mock('~/compositions/space/useNewMapObject');
jest.mock('vue-router');

function prepareUseNewMapObjectOnce() {
  const useNewMapObjectMock = {
    newMapObject: ref<null | Omit<Model.MapObject, '_id'>>(null),
    addMapObject: jest.fn(),
    saveNewMapObject: jest.fn(),
    positionNewMapObject: jest.fn(),
  };
  mocked(useNewMapObject).mockReturnValue(useNewMapObjectMock);
  return { useNewMapObjectMock };
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
    prepareUseNewMapObjectOnce();

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
      prepareUseNewMapObjectOnce();

      // when
      const wrapper = shallowMount(MapObjectsEdit, {
        props: {
          saveTrigger: false,
          abortTrigger: false,
        },
      });

      // then
      expect(wrapper.vm.mode).toBe('viewing');
      expect(wrapper.find('[data-test=save-button]').exists()).toBe(false);
      expect(wrapper.find('[data-test=delete-button]').exists()).toBe(false);
    });

    it('should not position map-object when in "viewing" mode (not selected a map-object)', async () => {
      expect.assertions(1);
      // given

      const { useNewMapObjectMock } = prepareUseNewMapObjectOnce();

      const wrapper = shallowMount(MapObjectsEdit, {
        props: {
          saveTrigger: false,
          abortTrigger: false,
        },
      });

      // when
      wrapper.findComponent(SpaceMap).vm.$emit('clickInsideSvg');
      await nextTick();

      // then
      expect(useNewMapObjectMock.positionNewMapObject).not.toHaveBeenCalled();
    });
  });
  describe('"creating" mode', () => {
    it('should go into "creating" mode when user clicked on add-table-button', async () => {
      expect.assertions(3);
      // given

      const { useNewMapObjectMock } = prepareUseNewMapObjectOnce();
      prepareUseFeathersMockOnce();

      // when
      const wrapper = shallowMount(MapObjectsEdit, {
        props: {
          saveTrigger: false,
          abortTrigger: false,
        },
      });
      await wrapper.findComponent('[data-test=add-button]').trigger('click');
      useNewMapObjectMock.newMapObject.value = sampleNewMapObject;
      await nextTick();

      // then
      expect(wrapper.emitted('change-happened')).toStrictEqual([[true]]);
      expect(wrapper.vm.newMapObject).toStrictEqual(sampleNewMapObject);
      expect(wrapper.vm.mode).toBe('creating');
    });

    it('should not select other map objects when clicking on them', async () => {
      expect.assertions(2);
      // given
      const { useNewMapObjectMock } = prepareUseNewMapObjectOnce();
      prepareUseFeathersMockOnce();
      const wrapper = shallowMount(MapObjectsEdit, {
        props: {
          saveTrigger: false,
          abortTrigger: false,
        },
      });
      await wrapper.findComponent('[data-test=add-button]').trigger('click');
      useNewMapObjectMock.newMapObject.value = sampleNewMapObject;
      await nextTick();
      replaceMock.mockClear();

      // when
      // await wrapper.findComponent(MapObjects).trigger('clickOnMapObject');

      // then
      expect(wrapper.vm.mode).toBe('creating');
      expect(replaceMock).not.toHaveBeenCalled();
    });

    it('should move the map-object to clicked position when in "creating" mode', async () => {
      expect.assertions(2);
      // given
      const { useNewMapObjectMock } = prepareUseNewMapObjectOnce();
      prepareUseFeathersMockOnce();
      const wrapper = shallowMount(MapObjectsEdit, {
        props: {
          saveTrigger: false,
          abortTrigger: false,
        },
      });

      await wrapper.find('[data-test=add-button]').trigger('click');
      useNewMapObjectMock.newMapObject.value = sampleNewMapObject;
      await nextTick();

      // simple mock for the SVGSVGElement received by the click event
      const position = { x: 11, y: 22 } as SVGPoint;
      wrapper.findComponent(SpaceMap).vm.$emit('click-inside-svg', position);
      await nextTick();

      // then
      expect(wrapper.vm.mode).toBe('creating');
      expect(useNewMapObjectMock.positionNewMapObject).toHaveBeenCalledWith(position);
    });
  });

  describe('"editing" mode', () => {
    it('should change url for "editing" mode when user clicked on a map-object', async () => {
      expect.assertions(1);
      // given
      prepareUseNewMapObjectOnce();
      prepareUseFeathersMockOnce();
      const wrapper = shallowMount(MapObjectsEdit, {
        props: {
          saveTrigger: false,
          abortTrigger: false,
        },
      });

      // when
      wrapper.findComponent(MapObjects).vm.$emit('clickOnMapObject', sampleMapObject);
      await nextTick();

      // then
      expect(replaceMock).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { selectedMapObjectId: sampleMapObject._id },
        }),
      );
    });

    it('should select map-object and be in "editing" mode when accessing with map-object-id url parameter', () => {
      expect.assertions(2);
      // given
      prepareUseNewMapObjectOnce();
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
      expect(wrapper.vm.mode).toBe('editing');
      expect(wrapper.find('[data-test=delete-button]').exists()).toBe(true);
    });

    it('should delete the selected map-object when clicking on delete', async () => {
      expect.assertions(2);
      // given
      prepareUseNewMapObjectOnce();
      const { remove } = prepareUseFeathersMockOnce();
      // when
      const wrapper = shallowMount(MapObjectsEdit, {
        props: {
          saveTrigger: false,
          abortTrigger: false,
          selectedMapObjectId: sampleMapObject._id,
        },
      });

      // when
      await wrapper.findComponent('[data-test=delete-button]').trigger('click');
      // then
      expect(remove).toHaveBeenCalledWith(sampleMapObject._id);
      expect(replaceMock).toHaveBeenCalledWith(
        expect.objectContaining({
          params: undefined,
        }),
      );
    });
  });
  it('should save sampleMapObject and emit change-happened when save trigger changes', async () => {
    expect.assertions(2);
    // given

    const { useNewMapObjectMock } = prepareUseNewMapObjectOnce();

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
    expect(wrapper.emitted('change-happened')).toStrictEqual([[false]]);
    expect(useNewMapObjectMock.saveNewMapObject).toHaveBeenCalledWith();
  });
  it('should set sampleNewMapObject to null and emit change-happened when abort trigger changes', async () => {
    expect.assertions(2);
    // given

    const { useNewMapObjectMock } = prepareUseNewMapObjectOnce();

    const wrapper = shallowMount(MapObjectsEdit, {
      props: {
        saveTrigger: false,
        abortTrigger: false,
      },
    });
    useNewMapObjectMock.newMapObject.value = sampleNewMapObject;

    // when
    await wrapper.setProps({ abortTrigger: true });
    await nextTick();

    // then
    expect(wrapper.emitted('change-happened')).toStrictEqual([[false]]);
    expect(wrapper.vm.newMapObject).toBeNull();
  });
  it('should open map-object details when clicking on edit', async () => {
    expect.assertions(1);
    // given

    prepareUseNewMapObjectOnce();
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
