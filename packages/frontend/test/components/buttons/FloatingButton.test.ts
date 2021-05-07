import { shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';

import FloatingButton from '~/components/buttons/FloatingButton.vue';

describe('FloatingButton component', () => {
  it('should render correctly', () => {
    // given
    const icon = 'settings';

    // when
    const wrapper = shallowMount(FloatingButton, {
      props: {
        icon,
      },
    });

    // then
    expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
  });

  it('should load the correct icon', () => {
    // given
    const icon = 'settings';

    // when
    const wrapper = shallowMount(FloatingButton, {
      props: {
        icon,
      },
    });

    // then
    expect(wrapper.find('[data-test=floating-button-icon]').attributes('name')).toBe(icon);
  });
});
