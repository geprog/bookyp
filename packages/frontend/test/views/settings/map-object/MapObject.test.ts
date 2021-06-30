import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';

import MapObject from '~/views/settings/map-object/MapObject.vue';
import { sampleBookable, sampleBookables } from '$/__fixtures__/bookable';
import { sampleMapObject, sampleMapObjects } from '$/__fixtures__/mapObject';
import {
  prepareUseFeathersMockOnce,
  prepareUseFindMockOnce,
  prepareUseGetMockOnce,
  prepareUseRouteMockOnce,
  prepareUseRouterMockOnce,
} from '$/__helpers__/mocks';

jest.mock('~/compositions/useFeathers');
jest.mock('~/compositions/useGet');
jest.mock('~/compositions/useFind');
jest.mock('vue-i18n');
jest.mock('vue-router');

describe('MapObject view', () => {
  describe('Template', () => {
    it('should render correctly', () => {
      // given
      prepareUseGetMockOnce(sampleMapObject);
      prepareUseGetMockOnce(sampleBookable);
      prepareUseFindMockOnce(sampleBookables);
      const useRouterMock = prepareUseRouterMockOnce();
      const useRouteMock = prepareUseRouteMockOnce({ name: 'settings-map-object' });

      // when
      const wrapper = shallowMount(MapObject, {
        props: {
          mapObjectId: sampleMapObjects[0]._id,
        },
        global: {
          mocks: {
            $router: useRouterMock,
            $route: useRouteMock,
          },
        },
      });

      // then
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should render correctly when selecting bookable', () => {
      // given
      prepareUseGetMockOnce(sampleMapObject);
      prepareUseGetMockOnce(sampleBookable);
      prepareUseFindMockOnce(sampleBookables);
      const useRouterMock = prepareUseRouterMockOnce();
      const useRouteMock = prepareUseRouteMockOnce({ name: 'settings-map-object-link' });

      // when
      const wrapper = shallowMount(MapObject, {
        props: {
          mapObjectId: sampleMapObject._id,
        },
        global: {
          mocks: {
            $router: useRouterMock,
            $route: useRouteMock,
          },
        },
      });

      // then
      expect(wrapper.html()).toMatchSnapshot();
    });
  });

  it('should save the map-object', async () => {
    // saveMapObject
    expect.assertions(2);

    // given
    prepareUseGetMockOnce(sampleMapObject);
    prepareUseGetMockOnce(sampleBookable);
    prepareUseFindMockOnce(sampleBookables);
    const useFeathersMock = prepareUseFeathersMockOnce();
    const useRouterMock = prepareUseRouterMockOnce();
    const useRouteMock = prepareUseRouteMockOnce({ name: 'settings-map-object' });

    const wrapper = shallowMount(MapObject, {
      props: {
        mapObjectId: sampleMapObject._id,
      },
      global: {
        mocks: {
          $router: useRouterMock,
          $route: useRouteMock,
        },
      },
    });

    // when
    wrapper.findComponent('[data-test=save-button]').vm.$emit('click');
    await nextTick();

    // then
    expect(useFeathersMock.update).toHaveBeenCalledTimes(1);
    expect(useRouterMock.back).toHaveBeenCalledTimes(1);
  });

  it('should select a bookable from the list', async () => {
    expect.assertions(2);
    // given
    const { data: mapObject } = prepareUseGetMockOnce(sampleMapObject);
    prepareUseGetMockOnce(sampleBookable);
    prepareUseFindMockOnce(sampleBookables);
    prepareUseFeathersMockOnce();
    const useRouterMock = prepareUseRouterMockOnce();
    const useRouteMock = prepareUseRouteMockOnce({ name: 'settings-map-object-link' });

    const wrapper = shallowMount(MapObject, {
      props: {
        mapObjectId: sampleMapObject._id,
      },
      global: {
        mocks: {
          $router: useRouterMock,
          $route: useRouteMock,
        },
      },
    });

    // when
    wrapper.findComponent('[data-test=select-bookable]').vm.$emit('click');
    await nextTick();

    // then
    expect(mapObject.value).toStrictEqual({
      ...sampleMapObject,
      bookable: sampleBookables[0]._id,
    });
    expect(useRouterMock.back).toHaveBeenCalledTimes(1);
  });

  it('should unlink a bookable from the map-object', async () => {
    // unlinkBookable
    expect.assertions(2);
    // given

    const linkedBookable = sampleBookable;
    const mapObject = sampleMapObject;
    mapObject.bookable = linkedBookable._id;

    prepareUseGetMockOnce(mapObject);
    prepareUseGetMockOnce(linkedBookable);
    prepareUseFindMockOnce(sampleBookables);
    const useFeathersMock = prepareUseFeathersMockOnce();
    const useRouterMock = prepareUseRouterMockOnce();
    const useRouteMock = prepareUseRouteMockOnce({ name: 'settings-map-object' });

    const wrapper = shallowMount(MapObject, {
      props: {
        mapObjectId: sampleMapObject._id,
      },
      global: {
        mocks: {
          $router: useRouterMock,
          $route: useRouteMock,
        },
        stubs: {
          IconListItem: {
            template: '<div><slot /><slot name="end"/></div>',
          },
        },
      },
    });

    // when
    wrapper.findComponent('[data-test=unlink-button]').vm.$emit('click');
    await nextTick();

    wrapper.findComponent('[data-test=save-button]').vm.$emit('click');
    await nextTick();

    // then
    expect(useFeathersMock.update).toHaveBeenCalledWith(sampleMapObject._id, {
      ...sampleMapObject,
      bookable: undefined,
    });
    expect(useRouterMock.back).toHaveBeenCalledTimes(1);
  });
});
