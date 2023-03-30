import { Model } from '@bookyp/core';
import { UseFindFunc } from '@geprog/use-feathers';
import { config, shallowMount } from '@vue/test-utils';
import { ref } from 'vue';

import SelectableListItem from '~/components/list-items/SelectableListItem.vue';
import useFind from '~/compositions/useFind';
import { back } from '~/compositions/useRouter';
import MapObject from '~/views/settings/map-object/MapObject.vue';
import { sampleBookable, sampleBookables } from '$/__fixtures__/bookable';
import { sampleMapObject, sampleMapObjects } from '$/__fixtures__/mapObject';
import { i18n } from '$/__helpers__/i18n';
import {
  prepareUseCurrentSpaceMockOnce,
  prepareUseFeathersMockOnce,
  prepareUseFindMockOnce,
  prepareUseGetMockOnce,
  prepareUseRouteMockOnce,
  prepareUseRouterMockOnce,
} from '$/__helpers__/mocks';

vi.mock('~/compositions/useFeathers');
vi.mock('~/compositions/useGet');
vi.mock('~/compositions/useFind');
vi.mock('~/compositions/space/useCurrentSpace');
vi.mock('vue-router');
vi.mock('~/compositions/useRouter');

describe('MapObject view', () => {
  beforeAll(() => {
    config.renderStubDefaultSlot = true;
  });

  beforeEach(() => {
    prepareUseCurrentSpaceMockOnce();
  });

  afterAll(() => {
    config.renderStubDefaultSlot = false;
  });

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
          mapObject: sampleMapObjects[0],
        },
        global: {
          mocks: {
            $router: useRouterMock,
            $route: useRouteMock,
          },
          plugins: [i18n],
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
          mapObject: sampleMapObject,
        },
        global: {
          mocks: {
            $router: useRouterMock,
            $route: useRouteMock,
          },
          plugins: [i18n],
        },
      });

      // then
      expect(wrapper.html()).toMatchSnapshot();
    });
  });

  it('should find bookables for selected space', () => {
    // given
    const useRouterMock = prepareUseRouterMockOnce();
    const useRouteMock = prepareUseRouteMockOnce({ name: 'settings-map-object-link' });
    prepareUseGetMockOnce(sampleMapObject);
    prepareUseGetMockOnce(sampleBookable);
    let params: Parameters<UseFindFunc<unknown>>[1];
    vi.mocked(useFind, true).mockImplementationOnce((_, _params) => {
      params = _params;

      return {
        data: ref([sampleBookable]),
        isLoading: ref(false),
        error: ref(),
        unload: vi.fn(),
      };
    });

    // when
    shallowMount(MapObject, {
      props: {
        mapObject: sampleMapObject,
      },
      global: {
        mocks: {
          $router: useRouterMock,
          $route: useRouteMock,
        },
        plugins: [i18n],
      },
    });

    // then
    expect(params?.value).toMatchSnapshot();
    expect(params?.value?.query).toHaveProperty('space');
  });

  it('should select a bookable from the list', async () => {
    expect.assertions(3);
    // given
    prepareUseGetMockOnce(sampleMapObject);
    prepareUseGetMockOnce(sampleBookable);
    prepareUseFindMockOnce(sampleBookables);
    prepareUseFeathersMockOnce();
    const useRouterMock = prepareUseRouterMockOnce();
    const backMock = vi.mocked(back);
    const useRouteMock = prepareUseRouteMockOnce({ name: 'settings-map-object-link' });

    const wrapper = shallowMount(MapObject, {
      props: {
        mapObject: sampleMapObject,
      },
      global: {
        mocks: {
          $router: useRouterMock,
          $route: useRouteMock,
        },
        plugins: [i18n],
      },
    });

    // when
    await wrapper.findComponent(SelectableListItem).trigger('click');

    // then
    const emittedValues = wrapper.emitted<Model.MapObject[]>()['update:mapObject'];
    expect(emittedValues).toHaveLength(1);
    expect(emittedValues[0]).toStrictEqual([
      {
        ...sampleMapObject,
        link: { type: 'bookable', bookable: sampleBookables[0]._id },
      },
    ]);
    expect(backMock).toHaveBeenCalledTimes(1);
  });

  it('should unlink a bookable from the map-object', async () => {
    // unlinkBookable
    expect.assertions(2);
    // given

    const linkedBookable = sampleBookable;
    const mapObject = sampleMapObject;
    mapObject.link = { type: 'bookable', bookable: linkedBookable._id };

    prepareUseGetMockOnce(mapObject);
    prepareUseGetMockOnce(linkedBookable);
    prepareUseFindMockOnce(sampleBookables);
    const useRouterMock = prepareUseRouterMockOnce();
    const useRouteMock = prepareUseRouteMockOnce({ name: 'settings-map-object' });

    const wrapper = shallowMount(MapObject, {
      props: {
        mapObject: sampleMapObject,
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
        plugins: [i18n],
      },
    });

    // when
    await wrapper.findComponent('[data-test=unlink-button]').trigger('click');

    // then
    const emittedValues = wrapper.emitted<Model.MapObject[]>()['update:mapObject'];
    expect(emittedValues).toHaveLength(1);
    expect(emittedValues[0][0].link?.type).toBeUndefined();
  });
});
