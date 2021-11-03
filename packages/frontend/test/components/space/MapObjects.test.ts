import { shallowMount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';

import MapObjects from '~/components/space/MapObjects.vue';
import useViewBox, { Path } from '~/compositions/space/useViewBox';
import { SpaceMapKey } from '~/symbols/space-map';
import { sampleMapObject, sampleMapObjects, sampleMapObjectWithBookable } from '$/__fixtures__/mapObject';
import { prepareUseMapObjectsMockOnce } from '$/__helpers__/mocks';

jest.mock('~/compositions/space/useMapObjects');

const SpaceMapMock = {
  registerViewBox: jest.fn(),
  unregisterViewBox: jest.fn(),
};

const globalOptions = {
  provide: {
    [SpaceMapKey as symbol]: SpaceMapMock,
  },
};

describe('MapObjects component', () => {
  it('should render correctly when clickable', () => {
    // given
    prepareUseMapObjectsMockOnce(sampleMapObjects);

    // when
    const wrapper = shallowMount(MapObjects, {
      props: {
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

    // when
    const wrapper = shallowMount(MapObjects, {
      props: {
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

    // when
    const wrapper = shallowMount(MapObjects, {
      props: {
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

    const wrapper = shallowMount(MapObjects, {
      props: {
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
    expect(wrapper.emitted('clickOnMapObject')?.[0]).toStrictEqual([sampleMapObjects[0]]);
  });

  it('should skip clickOnMapObject event when not clickable', async () => {
    expect.assertions(1);
    // given
    prepareUseMapObjectsMockOnce(sampleMapObjects);

    const wrapper = shallowMount(MapObjects, {
      props: {
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

    // when
    const wrapper = shallowMount(MapObjects, {
      props: {
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

    // when
    const wrapper = shallowMount(MapObjects, {
      props: {
        clickable: true,
      },
      global: globalOptions,
    });

    // then
    expect(wrapper.findAll('[data-test="map-object-path"]')).toHaveLength(2);
    expect(wrapper.findAll('[data-test="map-object-path"]')[0].attributes('class')).toBe(
      'stroke-black text-primary-dark fill-primary-light',
    );
    expect(wrapper.findAll('[data-test="map-object-path"]')[1].attributes('class')).toBe(
      'stroke-black text-primary-dark fill-primary-light',
    );
  });

  describe('view box handling', () => {
    it('should register view box if handler provided', () => {
      jest.resetAllMocks();
      // given
      prepareUseMapObjectsMockOnce(sampleMapObjects);
      const viewBox = useViewBox(
        ref(
          sampleMapObjects.reduce<Path[]>((allPaths, mapObject) => {
            const paths = mapObject.paths.map((path) => ({
              x: mapObject.xPos,
              y: mapObject.yPos,
              d: path,
            }));
            return [...allPaths, ...paths];
          }, []),
        ),
        { strokeWidth: 1 },
      );

      // when
      shallowMount(MapObjects, {
        props: {
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
      jest.resetAllMocks();
      // given
      prepareUseMapObjectsMockOnce(sampleMapObjects);
      const wrapper = shallowMount(MapObjects, {
        props: {
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
