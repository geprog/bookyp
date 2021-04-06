import { shallowMount } from '@vue/test-utils';
import { ref } from 'vue';

import useFeathers from '~/compositions/useFeathers';
import useFind from '~/compositions/useFind';
import Space from '~/views/settings/Space.vue';

jest.mock('~/compositions/useFeathers');
jest.mock('~/compositions/useFind');
jest.mock('vue-i18n');

describe('Space component', () => {
  it('should display a floorPlan', async () => {
    expect.assertions(2);
    // given
    // mock useFeathers
    const useFeathersMock = {
      service: () => ({
        find: jest.fn(() => []),
        create: jest.fn(),
      }),
    };
    (useFeathers as jest.Mock).mockReturnValue(useFeathersMock);

    // mock useFind
    const floorPlan = [
      'M288 325H30.2315V226.738H1V1H288V325Z',
      'M1 1.96375V44.2787H43.5143C43.4181 20.8928 24.4229 1.96428 1 1.96375Z',
    ];
    const useFindMock = {
      data: ref([
        {
          floorPlan,
        },
      ]),
    };
    (useFind as jest.Mock).mockReturnValue(useFindMock);

    // when
    const wrapper = shallowMount(Space, {});
    await wrapper.vm.$nextTick();

    // then
    expect(wrapper.findAll('path')[0].attributes('d')).toStrictEqual(floorPlan[0]);
    expect(wrapper.findAll('path')[1].attributes('d')).toStrictEqual(floorPlan[1]);
  });
});
