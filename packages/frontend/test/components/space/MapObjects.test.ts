import { shallowMount } from '@vue/test-utils';
import { computed, nextTick, ref } from 'vue';

import MapObjects from '~/components/space/MapObjects.vue';
import useViewBox, { mapObjectsToPaths } from '~/compositions/space/useViewBox';
import { useBookables } from '~/compositions/useBookables';
import { SpaceMapKey } from '~/symbols/space-map';
import { sampleBookings } from '$/__fixtures__/booking';
import { sampleMapObject, sampleMapObjects, sampleMapObjectWithBookable } from '$/__fixtures__/mapObject';
import { prepareUseFindMockOnce, prepareUseMapObjectsMockOnce } from '$/__helpers__/mocks';

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
    bookablesFilter: ref(),
    isFilterMatched: vi.fn().mockReturnValue(true),
    userBookings: ref([]),
    isBookedByMe: vi.fn().mockReturnValue(false),
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
      },
      global: globalOptions,
    });

    // then
    expect(wrapper.html()).toMatchSnapshot();
    expect(wrapper.findAll('path')).toHaveLength(4);
    expect(wrapper.findAll('path')[0].attributes('d')).toStrictEqual(sampleMapObjects[0].paths[0]);
    expect(wrapper.findAll('path')[1].attributes('d')).toStrictEqual(sampleMapObjects[0].paths[1]);
    expect(wrapper.findAll('path')[2].attributes('d')).toStrictEqual(sampleMapObjects[1].paths[0]);
    expect(wrapper.findAll('path')[3].attributes('d')).toStrictEqual(sampleMapObjects[1].paths[1]);
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
      },
      global: globalOptions,
    });

    // then
    expect(wrapper.html()).toMatchSnapshot();
    expect(wrapper.findAll('path')).toHaveLength(4);
    expect(wrapper.findAll('path')[0].attributes('d')).toStrictEqual(sampleMapObjects[0].paths[0]);
    expect(wrapper.findAll('path')[1].attributes('d')).toStrictEqual(sampleMapObjects[0].paths[1]);
    expect(wrapper.findAll('path')[2].attributes('d')).toStrictEqual(sampleMapObjects[1].paths[0]);
    expect(wrapper.findAll('path')[3].attributes('d')).toStrictEqual(sampleMapObjects[1].paths[1]);
  });

  it('should render correctly with a selectedMapObject', () => {
    // given
    prepareUseMapObjectsMockOnce([sampleMapObject]);
    prepareUseBookablesOnce();

    // when
    const wrapper = shallowMount(MapObjects, {
      props: {
        spaceId: '123',
        clickable: true,
        selectedMapObjectId: sampleMapObject._id,
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
      },
      global: globalOptions,
    });
    // when
    await wrapper.get('[data-test="map-object"]').trigger('click');
    await nextTick();

    // then
    expect(wrapper.emitted('clickOnMapObject')).toBeTruthy();
    expect(wrapper.emitted('clickOnMapObject')).toHaveLength(1);
    expect(wrapper.emitted('clickOnMapObject')?.[0]).toStrictEqual([sampleMapObjects[0].bookable]);
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
      },
      global: globalOptions,
    });

    // then
    expect(wrapper.findAll('[data-test="map-object-path"]')).toHaveLength(2);
    expect(wrapper.findAll('[data-test="map-object-path"]')[0].attributes('class')).toBe('stroke-black fill-white');
    expect(wrapper.findAll('[data-test="map-object-path"]')[1].attributes('class')).toBe('stroke-black fill-white');
  });

  it('should use primary fill color when the object is linked with a bookable', () => {
    // given
    prepareUseMapObjectsMockOnce([sampleMapObjectWithBookable]);
    prepareUseBookablesOnce();

    // when
    const wrapper = shallowMount(MapObjects, {
      props: {
        spaceId: '123',
        clickable: true,
      },
      global: globalOptions,
    });

    // then
    expect(wrapper.findAll('[data-test="map-object-path"]')).toHaveLength(2);
    expect(wrapper.findAll('[data-test="map-object-path"]')[0].attributes('class')).toBe(
      'stroke-black fill-primary-light',
    );
    expect(wrapper.findAll('[data-test="map-object-path"]')[1].attributes('class')).toBe(
      'stroke-black fill-primary-light',
    );
  });

  it('should use green fill color when the filter matches', () => {
    // given
    prepareUseMapObjectsMockOnce([sampleMapObjectWithBookable]);
    prepareUseBookablesOnce();

    // when
    const wrapper = shallowMount(MapObjects, {
      props: {
        spaceId: '123',
        clickable: true,
        considerFilter: true,
      },
      global: globalOptions,
    });

    // then
    expect(wrapper.findAll('[data-test="map-object-path"]')).toHaveLength(2);
    expect(wrapper.findAll('[data-test="map-object-path"]')[0].attributes('class')).toBe(
      'stroke-black fill-green-background',
    );
    expect(wrapper.findAll('[data-test="map-object-path"]')[1].attributes('class')).toBe(
      'stroke-black fill-green-background',
    );
  });

  it('should use red fill color when the filter matches', () => {
    // given
    prepareUseMapObjectsMockOnce([sampleMapObjectWithBookable]);

    vi.mocked(useBookables).mockReturnValueOnce({
      bookablesWithFilterMatched: computed(() => []),
      bookablesFilter: ref(),
      isFilterMatched: vi.fn().mockReturnValue(false),
      userBookings: ref([]),
      isBookedByMe: vi.fn().mockReturnValue(false),
    });

    // when
    const wrapper = shallowMount(MapObjects, {
      props: {
        spaceId: '123',
        clickable: true,
        considerFilter: true,
      },
      global: globalOptions,
    });

    // then
    expect(wrapper.findAll('[data-test="map-object-path"]')).toHaveLength(2);
    expect(wrapper.findAll('[data-test="map-object-path"]')[0].attributes('class')).toBe(
      'stroke-black fill-red-background',
    );
    expect(wrapper.findAll('[data-test="map-object-path"]')[1].attributes('class')).toBe(
      'stroke-black fill-red-background',
    );
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
