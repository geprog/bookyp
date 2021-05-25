import { shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';
import { mocked } from 'ts-jest/utils';
import { ref } from 'vue';

import useFeathers, { ClientApplication } from '~/compositions/useFeathers';
import useFind from '~/compositions/useFind';
import SpaceFloorPlan from '~/views/settings/SpaceFloorPlan.vue';

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

describe('SpaceFloorPlan view', () => {
  it('should render correctly', () => {
    // given
    const useFeathersMock = ({
      service: () => ({
        find: jest.fn(() => []),
        create: jest.fn(),
      }),
    } as unknown) as ClientApplication;
    mocked(useFeathers, true).mockReturnValue(useFeathersMock);

    const useFindMock = {
      data: ref([]),
      isLoading: ref(false),
    };
    mocked(useFind).mockReturnValue(useFindMock);

    // when
    const wrapper = shallowMount(SpaceFloorPlan);

    // then
    expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
  });

  it('should render a plan of the floor', () => {
    expect.assertions(2);
    // given
    const useFeathersMock = ({
      service: () => ({
        find: jest.fn(() => []),
        create: jest.fn(),
      }),
    } as unknown) as ClientApplication;
    mocked(useFeathers).mockReturnValue(useFeathersMock);

    const floorPlan = [
      'M288 325H30.2315V226.738H1V1H288V325Z',
      'M1 1.96375V44.2787H43.5143C43.4181 20.8928 24.4229 1.96428 1 1.96375Z',
    ];
    const useFindMock = {
      data: ref([
        {
          _id: 'dummy-id',
          floorPlan,
        },
      ]),
      isLoading: ref(false),
    };
    mocked(useFind).mockReturnValue(useFindMock);

    // when
    const wrapper = shallowMount(SpaceFloorPlan);

    // then
    expect(wrapper.findAll('path')[0].attributes('d')).toStrictEqual(floorPlan[0]);
    expect(wrapper.findAll('path')[1].attributes('d')).toStrictEqual(floorPlan[1]);
  });
});
