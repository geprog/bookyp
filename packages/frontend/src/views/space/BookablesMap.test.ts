import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';

import MapObjects from '~/components/space/map/MapObjects.vue';
import { sampleMapObject, sampleMapObjects, sampleMapObjectWithBookable } from '$/__fixtures__/mapObject';
import { sampleSpace } from '$/__fixtures__/space';
import { i18n } from '$/__helpers__/i18n';
import {
  prepareUseAuthorization,
  prepareUseCurrentSpaceMockOnce,
  prepareUseMapObjectsMockOnce,
  prepareUseRouterMockOnce,
} from '$/__helpers__/mocks';

import BookablesMap from './BookablesMap.vue';

vi.mock('~/compositions/space/useMapObjects');
vi.mock('~/compositions/space/useCurrentSpace');
vi.mock('~/compositions/useAuthorization');
vi.mock('vue-router');

describe('BookablesMap view', () => {
  it('should render correctly', () => {
    // given
    prepareUseCurrentSpaceMockOnce(sampleSpace);
    prepareUseAuthorization(false);
    prepareUseMapObjectsMockOnce(sampleMapObjects);

    // when
    const wrapper = shallowMount(BookablesMap, {
      global: {
        plugins: [i18n],
        stubs: ['router-link'],
      },
    });

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should render correctly when no space', () => {
    // given
    prepareUseCurrentSpaceMockOnce(undefined);
    prepareUseAuthorization(false);
    prepareUseMapObjectsMockOnce(sampleMapObjects);

    // when
    const wrapper = shallowMount(BookablesMap, {
      global: {
        plugins: [i18n],
        stubs: ['router-link'],
      },
    });

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should render correctly no-map svg when no floorplan and no map objects', () => {
    // given
    prepareUseCurrentSpaceMockOnce({ ...sampleSpace, floorPlan: [] });
    prepareUseAuthorization(false);
    prepareUseMapObjectsMockOnce([]);

    // when
    const wrapper = shallowMount(BookablesMap, {
      global: {
        plugins: [i18n],
        stubs: ['router-link'],
      },
    });

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should open booking-create view when clicked on mapObject', async () => {
    expect.assertions(1);
    // given
    prepareUseCurrentSpaceMockOnce(sampleSpace);
    prepareUseAuthorization(false);
    prepareUseMapObjectsMockOnce(sampleMapObjects);
    const useRouterMockOnce = prepareUseRouterMockOnce();
    const wrapper = shallowMount(BookablesMap, {
      global: {
        plugins: [i18n],
        stubs: ['router-link'],
      },
    });

    // when
    wrapper.getComponent(MapObjects).vm.$emit('clickOnMapObject', sampleMapObjectWithBookable);
    await nextTick();

    // then
    expect(useRouterMockOnce.push).toHaveBeenCalledWith({
      name: 'booking-create',
      params: { bookableId: (sampleMapObjectWithBookable.link as { bookable: string }).bookable },
    });
  });

  it('should not open booking-create view when clicked on mapObject that is not linked to a bookable', async () => {
    expect.assertions(1);
    // given
    prepareUseCurrentSpaceMockOnce(sampleSpace);
    prepareUseAuthorization(false);
    prepareUseMapObjectsMockOnce(sampleMapObjects);
    const useRouterMockOnce = prepareUseRouterMockOnce();
    const wrapper = shallowMount(BookablesMap, {
      global: {
        plugins: [i18n],
        stubs: ['router-link'],
      },
    });

    // when
    wrapper.getComponent(MapObjects).vm.$emit('clickOnMapObject', sampleMapObject);
    await nextTick();

    // then
    expect(useRouterMockOnce.push).not.toHaveBeenCalled();
  });
});
