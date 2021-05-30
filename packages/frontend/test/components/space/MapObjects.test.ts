import { shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';
import { mocked } from 'ts-jest/utils';
import { nextTick, ref } from 'vue';

import MapObjects from '~/components/space/MapObjects.vue';
import useFind from '~/compositions/useFind';
import { mapObjects } from '$/__fixtures__/mapObject';

jest.mock('~/compositions/useFind');

describe('FloorPlan component', () => {
  it('should render correctly when clickable', () => {
    expect.assertions(4);
    // given
    const mapObjectsMock = {
      data: ref(mapObjects),
      isLoading: ref(false),
    };

    mocked(useFind).mockReturnValueOnce(mapObjectsMock);

    // when
    const wrapper = shallowMount(MapObjects, {
      props: {
        clickable: true,
      },
    });

    // then
    expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
    expect(wrapper.findAll('path')).toHaveLength(4);
    expect(wrapper.findAll('path')[0].attributes('d')).toStrictEqual(mapObjects[0].paths[0]);
    expect(wrapper.findAll('path')[3].attributes('d')).toStrictEqual(mapObjects[0].paths[1]);
  });

  it('should render correctly when not clickable', () => {
    expect.assertions(4);
    // given
    const mapObjectsMock = {
      data: ref(mapObjects),
      isLoading: ref(false),
    };

    mocked(useFind).mockReturnValueOnce(mapObjectsMock);

    // when
    const wrapper = shallowMount(MapObjects, {
      props: {
        clickable: false,
      },
    });

    // then
    expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
    expect(wrapper.findAll('path')).toHaveLength(4); //
    expect(wrapper.findAll('path')[0].attributes('d')).toStrictEqual(mapObjects[0].paths[0]);
    expect(wrapper.findAll('path')[3].attributes('d')).toStrictEqual(mapObjects[0].paths[1]);
  });

  it('should render correctly with a selectedMapObject', () => {
    expect.assertions(4);
    // given
    const mapObjectsMock = {
      data: ref(mapObjects),
      isLoading: ref(false),
    };

    mocked(useFind).mockReturnValueOnce(mapObjectsMock);

    // when
    const wrapper = shallowMount(MapObjects, {
      props: {
        clickable: true,
        selectedMapObjectId: '2',
      },
    });

    // then
    expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
    expect(wrapper.findAll('path')).toHaveLength(4); //
    expect(wrapper.findAll('path')[0].attributes('d')).toStrictEqual(mapObjects[0].paths[0]);
    expect(wrapper.findAll('path')[3].attributes('d')).toStrictEqual(mapObjects[0].paths[1]);
  });

  it('should emit clickOnMapObject event', async () => {
    expect.assertions(3);
    // given
    const mapObjectsMock = {
      data: ref(mapObjects),
      isLoading: ref(false),
    };

    mocked(useFind).mockReturnValueOnce(mapObjectsMock);

    const wrapper = shallowMount(MapObjects, {
      props: {
        clickable: true,
      },
    });
    // when
    await wrapper.get('[data-test="map-object"]').trigger('click');
    await nextTick();

    // then
    expect(wrapper.emitted('clickOnMapObject')).toBeTruthy();
    expect(wrapper.emitted('clickOnMapObject')).toHaveLength(1);
    expect(wrapper.emitted('clickOnMapObject')?.[0]).toStrictEqual([mapObjects[0]]);
  });

  it('should skip clickOnMapObject event when not clickable', async () => {
    expect.assertions(1);
    // given
    const mapObjectsMock = {
      data: ref(mapObjects),
      isLoading: ref(false),
    };

    mocked(useFind).mockReturnValueOnce(mapObjectsMock);

    const wrapper = shallowMount(MapObjects, {
      props: {
        clickable: false,
      },
    });
    // when
    await wrapper.get('[data-test="map-object"]').trigger('click');
    await nextTick();

    // then
    expect(wrapper.emitted('clickOnMapObject')).toBeFalsy();
  });
});
