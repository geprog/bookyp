import { Model } from '@bookyp/core';
import { mount, shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';
import { mocked } from 'ts-jest/utils';
import { nextTick, ref } from 'vue';

import MapObjects from '~/components/space/MapObjects.vue';
import SpaceMap from '~/components/space/SpaceMap.vue';
import useNewMapObject from '~/compositions/space/useNewMapObject';
import useFind from '~/compositions/useFind';
import Space from '~/views/settings/Space.vue';
import { sampleMapObject, sampleNewMapObject } from '$/__fixtures__/mapObject';
import { prepareUseFeathersMockOnce, prepareUseRouteMockOnce, prepareUseRouterMockOnce } from '$/__helpers__/mocks';
import { mockSvg } from '$/__helpers__/svg';

jest.mock('~/compositions/space/useNewMapObject');
jest.mock('~/compositions/useFeathers');
jest.mock('~/compositions/useFind');
jest.mock('vue-router', () => ({
  useRoute: jest.fn(),
  useRouter: jest.fn(),
}));
jest.mock('vue-i18n');

function prepareUseNewMapObjectMock() {
  const useNewMapObjectMock = {
    newMapObject: ref<null | Omit<Model.MapObject, '_id'>>(null),
    addMapObject: jest.fn(),
    saveNewMapObject: jest.fn(),
    positionNewMapObject: jest.fn(),
  };
  mocked(useNewMapObject).mockReturnValue(useNewMapObjectMock);
  return useNewMapObjectMock;
}

function prepareCommonMocks() {
  const useFeathersMock = prepareUseFeathersMockOnce();
  const useRouterMock = prepareUseRouterMockOnce();
  const useRouteMock = prepareUseRouteMockOnce({ name: 'settings-space' });
  const useNewMapObjectMock = prepareUseNewMapObjectMock();

  return { useFeathersMock, useRouterMock, useRouteMock, useNewMapObjectMock };
}

describe('Space component', () => {
  describe('"viewing" mode', () => {
    it('should render correctly', () => {
      // given
      prepareCommonMocks();

      // when
      const wrapper = shallowMount(Space);

      // then
      expect(wrapper.vm.mode).toBe('viewing');
      expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
    });

    it('should start in "viewing" mode', () => {
      expect.assertions(3);
      // given
      prepareCommonMocks();

      // when
      const wrapper = shallowMount(Space);

      // then
      expect(wrapper.vm.mode).toBe('viewing');
      expect(wrapper.find('[data-test=save-button]').exists()).toBe(false);
      expect(wrapper.find('[data-test=delete-button]').exists()).toBe(false);
    });

    it('should not position map-object when in "viewing" mode (not selected a map-object)', async () => {
      expect.assertions(1);
      // given
      const useFindMock = {
        data: ref([]),
        isLoading: ref(false),
      };
      mocked(useFind).mockReturnValue(useFindMock);

      const { useNewMapObjectMock } = prepareCommonMocks();
      const wrapper = shallowMount(Space);

      // when
      wrapper.findComponent(SpaceMap).vm.$emit('clickInsideSvg');
      await nextTick();

      // then
      expect(useNewMapObjectMock.positionNewMapObject).not.toHaveBeenCalled();
    });
  });

  describe('"creating" mode', () => {
    it('should render correctly', () => {
      // given
      const { useNewMapObjectMock } = prepareCommonMocks();

      // when
      const wrapper = shallowMount(Space);
      useNewMapObjectMock.newMapObject.value = sampleNewMapObject;

      // then
      expect(wrapper.vm.mode).toBe('creating');
      expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
    });

    it('should go into "creating" mode when user clicked on add-table-button', async () => {
      expect.assertions(3);
      // given
      const { useNewMapObjectMock, useRouteMock, useRouterMock } = prepareCommonMocks();

      // when
      const wrapper = mount(Space, {
        global: {
          mocks: {
            $route: useRouteMock,
            $router: useRouterMock,
          },
        },
      });
      wrapper.findComponent('[data-test=add-button]').vm.$emit('click');
      useNewMapObjectMock.newMapObject.value = sampleNewMapObject;
      await nextTick();

      // then
      expect(wrapper.vm.mode).toBe('creating');
      expect(wrapper.vm.newMapObject).toBeDefined();
      expect(wrapper.find('[data-test=save-button]').exists()).toBe(true);
    });

    it('should not select other map objects when clicking on them', async () => {
      expect.assertions(1);
      // given
      const { useNewMapObjectMock, useRouteMock, useRouterMock } = prepareCommonMocks();

      const wrapper = mount(Space, {
        global: {
          mocks: {
            $route: useRouteMock,
            $router: useRouterMock,
          },
        },
      });
      wrapper.findComponent('[data-test=add-button]').vm.$emit('click');
      useNewMapObjectMock.newMapObject.value = sampleNewMapObject;
      await nextTick();

      // when
      wrapper.findComponent(MapObjects).vm.$emit('clickOnMapObject');

      // then
      expect(useRouterMock.replace).not.toHaveBeenCalled();
    });

    it('should move the map-object to clicked position when in "creating" mode', async () => {
      expect.assertions(4);
      // given
      const { useNewMapObjectMock, useRouteMock, useRouterMock } = prepareCommonMocks();

      const useFindMock = {
        data: ref([]),
        isLoading: ref(false),
      };
      mocked(useFind).mockReturnValue(useFindMock);
      const wrapper = mount(Space, {
        global: {
          mocks: {
            $route: useRouteMock,
            $router: useRouterMock,
          },
        },
      });

      await wrapper.find('[data-test=add-button]').trigger('click');
      useNewMapObjectMock.newMapObject.value = sampleNewMapObject;
      await nextTick();

      // simple mock for the SVGSVGElement received by the click event
      const position = { x: 11, y: 22 } as SVGPoint;
      const svgPoint = {
        x: 0,
        y: 0,
        matrixTransform: () => position,
      } as SVGPoint;
      const svg = mockSvg(wrapper.find('[data-test=space-map]'));
      mocked(svg.element.createSVGPoint).mockReturnValueOnce(svgPoint);

      // when
      await svg.trigger('click', { clientX: 0, clientY: 0 });
      useNewMapObjectMock.newMapObject.value.xPos = position.x;
      useNewMapObjectMock.newMapObject.value.yPos = position.y;
      await nextTick();

      // then
      const newMapObjectHtml = wrapper.find('[data-test=new-map-object]').html();
      const regexResult = /translate\((.*?),(.*?)\)/.exec(newMapObjectHtml);
      if (!regexResult) {
        throw new Error("Can't find the position of the new mapObject");
      }

      const [, posX, posY] = regexResult;

      expect(regexResult).toHaveLength(3); // 1 total match with 2 groups
      expect(parseInt(posX)).toBe(position.x);
      expect(parseInt(posY)).toBe(position.y);
      expect(useNewMapObjectMock.positionNewMapObject).toHaveBeenCalledWith(position);
    });
  });

  describe('"editing" mode', () => {
    it('should render correctly', () => {
      // given
      prepareCommonMocks();

      // when
      const wrapper = shallowMount(Space, {
        props: {
          selectedMapObjectId: sampleMapObject._id,
        },
      });

      // then
      expect(wrapper.vm.mode).toBe('editing');
      expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
    });

    it('should change url for "editing" mode when user clicked on a map-object', async () => {
      expect.assertions(1);
      // given
      const { useRouteMock, useRouterMock } = prepareCommonMocks();
      const wrapper = mount(Space, {
        global: {
          mocks: {
            $route: useRouteMock,
            $router: useRouterMock,
          },
        },
      });

      // when
      wrapper.findComponent(MapObjects).vm.$emit('clickOnMapObject', sampleMapObject);
      await nextTick();

      // then
      expect(useRouterMock.replace).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { selectedMapObjectId: sampleMapObject._id },
        }),
      );
    });

    it('should select map-object and be in "editing" mode when accessing with map-object-id url parameter', () => {
      expect.assertions(2);
      // given
      const { useRouteMock, useRouterMock } = prepareCommonMocks();

      // when
      const wrapper = mount(Space, {
        global: {
          mocks: {
            $route: useRouteMock,
            $router: useRouterMock,
          },
        },
        props: {
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
      const { useFeathersMock, useRouteMock, useRouterMock } = prepareCommonMocks();
      const wrapper = mount(Space, {
        global: {
          mocks: {
            $route: useRouteMock,
            $router: useRouterMock,
          },
        },
        props: {
          selectedMapObjectId: sampleMapObject._id,
        },
      });

      // when
      await wrapper.find('[data-test=delete-button]').trigger('click');

      // then
      expect(useFeathersMock.remove).toHaveBeenCalledWith(sampleMapObject._id);
      expect(useRouterMock.replace).toHaveBeenCalledWith(
        expect.objectContaining({
          params: undefined,
        }),
      );
    });
  });
});
