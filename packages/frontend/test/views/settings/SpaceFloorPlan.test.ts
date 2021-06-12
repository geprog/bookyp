import { shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';

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
    // when
    const wrapper = shallowMount(SpaceFloorPlan);

    // then
    expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
  });
});
