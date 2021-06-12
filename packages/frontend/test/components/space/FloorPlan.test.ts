import { shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';
import { mocked } from 'ts-jest/utils';
import { ref } from 'vue';

import FloorPlan from '~/components/space/FloorPlan.vue';
import useFeathers, { ClientApplication } from '~/compositions/useFeathers';
import useFind from '~/compositions/useFind';
import { sampleFloorPlan } from '$/__fixtures__/floorPlan';

jest.mock('~/compositions/useFind');
jest.mock('~/compositions/useFeathers');

describe('FloorPlan component', () => {
  it('should render correctly', () => {
    // given
    const useFeathersMock = {
      service: () => ({
        find: jest.fn(() => []),
        create: jest.fn(),
      }),
    } as unknown as ClientApplication;
    mocked(useFeathers).mockReturnValue(useFeathersMock);

    const useFindMock = {
      data: ref([
        {
          _id: 'dummy-id',
          floorPlan: sampleFloorPlan,
        },
      ]),
      isLoading: ref(false),
    };
    mocked(useFind).mockReturnValue(useFindMock);

    // when
    const wrapper = shallowMount(FloorPlan, {});

    // then
    expect(wrapper.findAll('path')[0].attributes('d')).toStrictEqual(sampleFloorPlan[0]);
    expect(wrapper.findAll('path')[1].attributes('d')).toStrictEqual(sampleFloorPlan[1]);
    expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
  });
});
