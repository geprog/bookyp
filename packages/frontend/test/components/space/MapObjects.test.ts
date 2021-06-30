import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';

import MapObjects from '~/components/space/MapObjects.vue';
import { sampleMapObjects } from '$/__fixtures__/mapObject';
import { prepareUseFindMockOnce } from '$/__helpers__/mocks';

jest.mock('~/compositions/useFind');

describe('MapObjects component', () => {
  it('should render correctly when clickable', () => {
    expect.assertions(4);
    // given
    prepareUseFindMockOnce(sampleMapObjects);

    // when
    const wrapper = shallowMount(MapObjects, {
      props: {
        clickable: true,
      },
    });

    // then
    expect(wrapper.html()).toMatchSnapshot();
    expect(wrapper.findAll('path')).toHaveLength(4);
    expect(wrapper.findAll('path')[0].attributes('d')).toStrictEqual(sampleMapObjects[0].paths[0]);
    expect(wrapper.findAll('path')[3].attributes('d')).toStrictEqual(sampleMapObjects[0].paths[1]);
  });

  it('should render correctly when not clickable', () => {
    expect.assertions(4);
    // given
    prepareUseFindMockOnce(sampleMapObjects);

    // when
    const wrapper = shallowMount(MapObjects, {
      props: {
        clickable: false,
      },
    });

    // then
    expect(wrapper.html()).toMatchSnapshot();
    expect(wrapper.findAll('path')).toHaveLength(4); //
    expect(wrapper.findAll('path')[0].attributes('d')).toStrictEqual(sampleMapObjects[0].paths[0]);
    expect(wrapper.findAll('path')[3].attributes('d')).toStrictEqual(sampleMapObjects[0].paths[1]);
  });

  it('should render correctly with a selectedMapObject', () => {
    expect.assertions(4);
    // given
    prepareUseFindMockOnce(sampleMapObjects);

    // when
    const wrapper = shallowMount(MapObjects, {
      props: {
        clickable: true,
        selectedMapObjectId: '2',
      },
    });

    // then
    expect(wrapper.html()).toMatchSnapshot();
    expect(wrapper.findAll('path')).toHaveLength(4); //
    expect(wrapper.findAll('path')[0].attributes('d')).toStrictEqual(sampleMapObjects[0].paths[0]);
    expect(wrapper.findAll('path')[3].attributes('d')).toStrictEqual(sampleMapObjects[0].paths[1]);
  });

  it('should emit clickOnMapObject event', async () => {
    expect.assertions(3);
    // given
    prepareUseFindMockOnce(sampleMapObjects);

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
    expect(wrapper.emitted('clickOnMapObject')?.[0]).toStrictEqual([sampleMapObjects[0]]);
  });

  it('should skip clickOnMapObject event when not clickable', async () => {
    expect.assertions(1);
    // given
    prepareUseFindMockOnce(sampleMapObjects);

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
