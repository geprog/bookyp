import { shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';

import IconButton from '~/components/buttons/IconButton.vue';

describe('IconButton component', () => {
  it('should render correctly', () => {
    // given
    const icon = 'settings';

    // when
    const wrapper = shallowMount(IconButton, {
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
    const wrapper = shallowMount(IconButton, {
      props: {
        icon,
      },
    });

    // then
    expect(wrapper.find('[data-test=button-icon]').attributes('name')).toBe(icon);
  });
});
