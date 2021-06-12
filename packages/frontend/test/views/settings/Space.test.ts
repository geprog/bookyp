import { Model } from '@bookyp/core';
import { mount, shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';
import { mocked } from 'ts-jest/utils';
import { nextTick, ref } from 'vue';
import { Router, useRouter } from 'vue-router';

import MapObjects from '~/components/space/MapObjects.vue';
import SpaceMap from '~/components/space/SpaceMap.vue';
import useNewMapObject from '~/compositions/space/useNewMapObject';
import useFeathers, { ClientApplication } from '~/compositions/useFeathers';
import useFind from '~/compositions/useFind';
import Space from '~/views/settings/Space.vue';
import { sampleNewMapObject } from '$/__fixtures__/mapObject';
import { mockSvg } from '$/helpers/svg';

jest.mock('~/compositions/space/useNewMapObject');
jest.mock('~/compositions/useFeathers');
jest.mock('~/compositions/useFind');
jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => ({ name: 'settings-space' })),
  useRouter: jest.fn(() => ({
    replace: jest.fn(),
    push: jest.fn(),
  })),
}));
jest.mock('vue-i18n');

function prepareShallowMount() {
  const useFeathersMock = ({
    service: () => ({
      find: jest.fn(() => []),
      create: jest.fn(),
    }),
  } as unknown) as ClientApplication;
  mocked(useFeathers, true).mockReturnValue(useFeathersMock);

  const useNewMapObjectMock = {
    newMapObject: ref(null),
    addMapObject: jest.fn(),
    saveNewMapObject: jest.fn(),
    positionNewMapObject: jest.fn(),
  };
  mocked(useNewMapObject).mockReturnValue(useNewMapObjectMock);
  return { useNewMapObjectMock };
}

function prepareMount() {
  const useFeathersMock = ({
    service: () => ({
      find: jest.fn(() => []),
      create: jest.fn(),
    }),
  } as unknown) as ClientApplication;
  mocked(useFeathers).mockReturnValue(useFeathersMock);

  const useNewMapObjectMock = {
    newMapObject: ref<null | Omit<Model.MapObject, '_id'>>(null),
    addMapObject: jest.fn(),
    saveNewMapObject: jest.fn(),
    positionNewMapObject: jest.fn(),
  };
  mocked(useNewMapObject).mockReturnValue(useNewMapObjectMock);

  const mockRoute = {};
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
  };
  return { useNewMapObjectMock, mockRoute, mockRouter };
}

function prepareReplaceMock() {
  const replaceMock = jest.fn();
  const useRouterMock = ({
    replace: replaceMock,
  } as unknown) as Router;
  mocked(useRouter).mockReturnValue(useRouterMock);
  return { replaceMock };
}

describe('Space component', () => {
  it('should render correctly', () => {
    // given
    prepareShallowMount();

    // when
    const wrapper = shallowMount(Space, {});

    // then
    expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
  });

  describe('"viewing" mode', () => {
    it('should start in "viewing" mode', () => {
      expect.assertions(3);
      // given
      prepareShallowMount();

      // when
      const wrapper = shallowMount(Space);

      // then
      expect(wrapper.vm.mode).toBe('viewing');
      // TODO: check buttons which should be there
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

      const { useNewMapObjectMock } = prepareShallowMount();

      const wrapper = shallowMount(Space, {});

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

      const { useNewMapObjectMock, mockRoute, mockRouter } = prepareMount();

      // when
      const wrapper = mount(Space, {
        global: {
          mocks: {
            $route: mockRoute,
            $router: mockRouter,
          },
        },
      });
      wrapper.findComponent('[data-test=add-button]').vm.$emit('click');
      useNewMapObjectMock.newMapObject.value = sampleNewMapObject;
      await nextTick();

      // then
      expect(wrapper.vm.newMapObject).toBeDefined();
      expect(wrapper.vm.mode).toBe('creating');
      expect(wrapper.find('[data-test=save-button]').exists()).toBe(true);
    });

    it('should not select other map objects when clicking on them', async () => {
      expect.assertions(1);
      // given
      const { useNewMapObjectMock, mockRoute, mockRouter } = prepareMount();

      const wrapper = mount(Space, {
        global: {
          mocks: {
            $route: mockRoute,
            $router: mockRouter,
          },
        },
      });
      wrapper.findComponent('[data-test=add-button]').vm.$emit('click');
      useNewMapObjectMock.newMapObject.value = sampleNewMapObject;
      await nextTick();

      // when
      wrapper.findComponent(MapObjects).vm.$emit('clickOnMapObject');

      // then
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it('should move the map-object to clicked position when in "creating" mode', async () => {
      expect.assertions(4);

      const { useNewMapObjectMock, mockRoute, mockRouter } = prepareMount();

      const useFindMock = {
        data: ref([]),
        isLoading: ref(false),
      };
      mocked(useFind).mockReturnValue(useFindMock);
      const wrapper = mount(Space, {
        global: {
          mocks: {
            $route: mockRoute,
            $router: mockRouter,
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
    it('should change url for "editing" mode when user clicked on a map-object', async () => {
      expect.assertions(1);
      // given
      const { mockRoute, mockRouter } = prepareMount();

      const { replaceMock } = prepareReplaceMock();

      const wrapper = mount(Space, {
        global: {
          mocks: {
            $route: mockRoute,
            $router: mockRouter,
          },
        },
      });

      const mapObject = {
        _id: '1',
      };

      // when
      wrapper.findComponent(MapObjects).vm.$emit('clickOnMapObject', mapObject);
      await nextTick();

      // then
      expect(replaceMock).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { selectedMapObjectId: mapObject._id },
        }),
      );
    });

    it('should select map-object and be in "editing" mode when accessing with map-object-id url parameter', () => {
      expect.assertions(2);
      // given
      const { mockRoute, mockRouter } = prepareMount();

      const mapObject = {
        _id: '1',
      };

      // when
      const wrapper = mount(Space, {
        global: {
          mocks: {
            $route: mockRoute,
            $router: mockRouter,
          },
        },
        props: {
          selectedMapObjectId: mapObject._id,
        },
      });

      // then
      expect(wrapper.vm.mode).toBe('editing');
      expect(wrapper.find('[data-test=delete-button]').exists()).toBe(true);
    });

    it('should delete the selected map-object when clicking on delete', async () => {
      expect.assertions(2);

      const { mockRoute, mockRouter } = prepareMount();
      const { replaceMock } = prepareReplaceMock();

      const useFeathersMock = ({
        service: () => useFeathersServiceMock,
      } as unknown) as ClientApplication;
      mocked(useFeathers).mockReturnValue(useFeathersMock);
      const useFindMock = {
        data: ref([]),
        isLoading: ref(false),
      };
      mocked(useFind).mockReturnValue(useFindMock);

      const useFeathersServiceMock = {
        find: jest.fn(() => []),
        create: jest.fn(),
        remove: jest.fn(),
      };

      const mapObject = {
        _id: '1',
      };

      const wrapper = mount(Space, {
        global: {
          mocks: {
            $route: mockRoute,
            $router: mockRouter,
          },
        },
        props: {
          selectedMapObjectId: mapObject._id,
        },
      });

      // when
      await wrapper.find('[data-test=delete-button]').trigger('click');

      // then
      expect(useFeathersServiceMock.remove).toHaveBeenCalledWith(mapObject._id);
      expect(replaceMock).toHaveBeenCalledWith(
        expect.objectContaining({
          params: undefined,
        }),
      );
    });
  });
});
