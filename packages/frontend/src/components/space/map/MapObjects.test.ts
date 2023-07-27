import { Model } from '@bookyp/core';
import { shallowMount } from '@vue/test-utils';
import { computed, nextTick, ref } from 'vue';

import useViewBox, { mapObjectsToPaths } from '~/compositions/space/useViewBox';
import { useBookables } from '~/compositions/useBookables';
import { SpaceMapKey } from '~/symbols/space-map';
import { sampleBookings } from '$/__fixtures__/booking';
import {
  sampleMapObject,
  sampleMapObjects,
  sampleMapObjectWithBookable,
  sampleMapObjectWithExternalUrl,
} from '$/__fixtures__/mapObject';
import { prepareUseFindMockOnce, prepareUseMapObjectsMockOnce } from '$/__helpers__/mocks';

import MapObjects from './MapObjects.vue';

vi.mock('~/compositions/space/useMapObjects');
vi.mock('~/compositions/useFind');
vi.mock('~/compositions/useBookables');

const SpaceMapMock = {
  registerViewBox: vi.fn(),
  unregisterViewBox: vi.fn(),
};

const globalOptions = {
  provide: {
    [SpaceMapKey as symbol]: SpaceMapMock,
  },
};

const prepareUseBookablesOnce = () => {
  vi.mocked(useBookables).mockReturnValueOnce({
    bookablesWithFilterMatched: computed(() => []),
    dateFilter: ref({
      start: undefined,
      end: undefined,
    }),
    quickFilter: ref({
      start: undefined,
      end: undefined,
    }),
    combinedFilter: ref({
      start: undefined,
      end: undefined,
    }),
    quickFilterDiffMinutes: ref(15),
    isFilterMatched: vi.fn().mockReturnValue(true),
    userBookings: ref([]),
    isBookedByMe: vi.fn().mockReturnValue(false),
    resetBookablesFilter: vi.fn(),
    isRequested: vi.fn(),
    isRequestedByMe: vi.fn(),
    allBookings: ref([]),
  });
};

describe('MapObjects component', () => {
  beforeEach(() => {
    prepareUseFindMockOnce();
  });

  it('should render correctly when clickable', () => {
    // given
    prepareUseMapObjectsMockOnce(sampleMapObjects);
    prepareUseBookablesOnce();

    // when
    const wrapper = shallowMount(MapObjects, {
      props: {
        spaceId: '123',
        clickable: true,
        mode: 'show-availability',
      },
      global: globalOptions,
    });

    // then
    /* eslint-disable jest/max-expects */
    expect(wrapper.html()).toMatchSnapshot();
    expect(wrapper.findAll('path')).toHaveLength(4);
    expect(wrapper.findAll('path')[0].attributes('d')).toStrictEqual(sampleMapObjects[0].paths[0]);
    expect(wrapper.findAll('path')[1].attributes('d')).toStrictEqual(sampleMapObjects[0].paths[1]);
    expect(wrapper.findAll('path')[2].attributes('d')).toStrictEqual(sampleMapObjects[1].paths[0]);
    expect(wrapper.findAll('path')[3].attributes('d')).toStrictEqual(sampleMapObjects[1].paths[1]);
    /* eslint-enable jest/max-expects */
  });

  it('should render correctly when not clickable', () => {
    // given
    prepareUseMapObjectsMockOnce(sampleMapObjects);
    prepareUseBookablesOnce();

    // when
    const wrapper = shallowMount(MapObjects, {
      props: {
        spaceId: '123',
        clickable: false,
        mode: 'show-availability',
      },
      global: globalOptions,
    });

    // then
    /* eslint-disable jest/max-expects */
    expect(wrapper.html()).toMatchSnapshot();
    expect(wrapper.findAll('path')).toHaveLength(4);
    expect(wrapper.findAll('path')[0].attributes('d')).toStrictEqual(sampleMapObjects[0].paths[0]);
    expect(wrapper.findAll('path')[1].attributes('d')).toStrictEqual(sampleMapObjects[0].paths[1]);
    expect(wrapper.findAll('path')[2].attributes('d')).toStrictEqual(sampleMapObjects[1].paths[0]);
    expect(wrapper.findAll('path')[3].attributes('d')).toStrictEqual(sampleMapObjects[1].paths[1]);
    /* eslint-enable jest/max-expects */
  });

  it('should render correctly with a highlighted bookable', () => {
    // given
    prepareUseMapObjectsMockOnce([sampleMapObject]);
    prepareUseBookablesOnce();

    // when
    const wrapper = shallowMount(MapObjects, {
      props: {
        spaceId: '123',
        clickable: true,
        highlightedBookableId: sampleMapObject._id,
        mode: 'highlight',
      },
      global: globalOptions,
    });

    // then
    expect(wrapper.html()).toMatchSnapshot();
    expect(wrapper.findAll('path')).toHaveLength(2);
    expect(wrapper.findAll('path')[0].attributes('d')).toStrictEqual(sampleMapObject.paths[0]);
    expect(wrapper.findAll('path')[1].attributes('d')).toStrictEqual(sampleMapObject.paths[1]);
  });

  it('should emit clickOnMapObject event', async () => {
    expect.assertions(3);
    // given
    prepareUseMapObjectsMockOnce(sampleMapObjects);
    prepareUseBookablesOnce();

    const wrapper = shallowMount(MapObjects, {
      props: {
        spaceId: '123',
        clickable: true,
        mode: 'show-availability',
      },
      global: globalOptions,
    });

    // when
    await wrapper.get('[data-test="map-object"].map-object.clickable').trigger('click');
    await nextTick();

    // then
    expect(wrapper.emitted('clickOnMapObject')).toBeTruthy();
    expect(wrapper.emitted('clickOnMapObject')).toHaveLength(1);
    expect(wrapper.emitted<[Model.MapObject]>('clickOnMapObject')?.[0]?.[0]?._id).toStrictEqual(
      sampleMapObjects[1]._id,
    );
  });

  it('should skip clickOnMapObject event when not clickable', async () => {
    expect.assertions(1);
    // given
    prepareUseMapObjectsMockOnce(sampleMapObjects);
    prepareUseBookablesOnce();

    const wrapper = shallowMount(MapObjects, {
      props: {
        spaceId: '123',
        clickable: false,
        mode: 'show-availability',
      },
      global: globalOptions,
    });
    // when
    await wrapper.get('[data-test="map-object"]').trigger('click');
    await nextTick();

    // then
    expect(wrapper.emitted('clickOnMapObject')).toBeFalsy();
  });

  it('should use white fill color when the object is not linked with a bookable', () => {
    // given
    prepareUseMapObjectsMockOnce([sampleMapObject]);
    prepareUseBookablesOnce();
    prepareUseFindMockOnce(sampleBookings);

    // when
    const wrapper = shallowMount(MapObjects, {
      props: {
        spaceId: '123',
        clickable: true,
        mode: 'show-availability',
      },
      global: globalOptions,
    });

    // then
    expect(wrapper.findAll('[data-test="map-object-path"]')).toHaveLength(2);
    expect(wrapper.findAll('[data-test="map-object-path"]')[0].attributes('class')).toBe('');
    expect(wrapper.findAll('[data-test="map-object-path"]')[1].attributes('class')).toBe('');
  });

  it('should use green fill color when the bookable is free', () => {
    // given
    prepareUseMapObjectsMockOnce([sampleMapObjectWithBookable]);
    prepareUseBookablesOnce();

    // when
    const wrapper = shallowMount(MapObjects, {
      props: {
        spaceId: '123',
        clickable: true,
        mode: 'show-availability',
      },
      global: globalOptions,
    });

    // then
    expect(wrapper.findAll('[data-test="map-object-path"]')).toHaveLength(2);
    expect(wrapper.findAll('[data-test="map-object-path"]')[0].attributes('class')).toBe('free');
    expect(wrapper.findAll('[data-test="map-object-path"]')[1].attributes('class')).toBe('free');
  });

  it('should use red fill color when the bookable is occupied', () => {
    // given
    prepareUseMapObjectsMockOnce([sampleMapObjectWithBookable]);

    vi.mocked(useBookables).mockReturnValueOnce({
      bookablesWithFilterMatched: computed(() => []),
      dateFilter: ref({
        start: undefined,
        end: undefined,
      }),
      quickFilter: ref({
        start: undefined,
        end: undefined,
      }),
      combinedFilter: ref({
        start: undefined,
        end: undefined,
      }),
      quickFilterDiffMinutes: ref(15),
      isFilterMatched: vi.fn().mockReturnValue(false),
      userBookings: ref([]),
      isBookedByMe: vi.fn().mockReturnValue(false),
      resetBookablesFilter: vi.fn(),
      isRequested: vi.fn(),
      isRequestedByMe: vi.fn(),
      allBookings: ref([]),
    });

    // when
    const wrapper = shallowMount(MapObjects, {
      props: {
        spaceId: '123',
        clickable: true,
        mode: 'show-availability',
      },
      global: globalOptions,
    });

    // then
    expect(wrapper.findAll('[data-test="map-object-path"]')).toHaveLength(2);
    expect(wrapper.findAll('[data-test="map-object-path"]')[0].attributes('class')).toBe('occupied');
    expect(wrapper.findAll('[data-test="map-object-path"]')[1].attributes('class')).toBe('occupied');
  });

  it('should use blue fill color when the map-object is linked to an external url', () => {
    // given
    prepareUseMapObjectsMockOnce([sampleMapObjectWithExternalUrl]);

    vi.mocked(useBookables).mockReturnValueOnce({
      bookablesWithFilterMatched: computed(() => []),
      dateFilter: ref({
        start: undefined,
        end: undefined,
      }),
      quickFilter: ref({
        start: undefined,
        end: undefined,
      }),
      combinedFilter: ref({
        start: undefined,
        end: undefined,
      }),
      quickFilterDiffMinutes: ref(15),
      isFilterMatched: vi.fn().mockReturnValue(false),
      userBookings: ref([]),
      isBookedByMe: vi.fn().mockReturnValue(false),
      resetBookablesFilter: vi.fn(),
      isRequested: vi.fn(),
      isRequestedByMe: vi.fn(),
      allBookings: ref([]),
    });

    // when
    const wrapper = shallowMount(MapObjects, {
      props: {
        spaceId: '123',
        clickable: true,
        mode: 'show-availability',
      },
      global: globalOptions,
    });

    // then
    expect(wrapper.findAll('[data-test="map-object-path"]')).toHaveLength(2);
    expect(wrapper.findAll('[data-test="map-object-path"]')[0].attributes('class')).toBe('linked-to-url');
    expect(wrapper.findAll('[data-test="map-object-path"]')[1].attributes('class')).toBe('linked-to-url');
  });

  describe('view box handling', () => {
    it('should register view box if handler provided', () => {
      // given
      prepareUseMapObjectsMockOnce(sampleMapObjects);

      prepareUseBookablesOnce();
      const viewBox = useViewBox(mapObjectsToPaths(ref(sampleMapObjects)), { strokeWidth: 1 });

      // when
      shallowMount(MapObjects, {
        props: {
          spaceId: '123',
          clickable: true,
          mode: 'highlight',
        },
        global: globalOptions,
      });

      // then
      expect(SpaceMapMock.registerViewBox).toHaveBeenCalledWith(
        'MapObjects',
        expect.objectContaining({ value: viewBox.value }),
      );
    });

    it('should unregister view box when unmount if handler provided', () => {
      // given
      prepareUseMapObjectsMockOnce(sampleMapObjects);
      prepareUseBookablesOnce();

      const wrapper = shallowMount(MapObjects, {
        props: {
          spaceId: '123',
          clickable: true,
          mode: 'highlight',
        },
        global: globalOptions,
      });

      // when
      wrapper.unmount();

      // then
      expect(SpaceMapMock.unregisterViewBox).toHaveBeenCalledWith('MapObjects');
    });
  });
});
