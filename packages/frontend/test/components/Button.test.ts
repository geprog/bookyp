import { shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';

import Button from '~/components/Button.vue';

describe('Button component', () => {
  it('should render correctly', () => {
    // given
    const iconName = 'testIcon';

    // when
    const wrapper = shallowMount(Button, {
      props: {
        iconName,
      },
    });

    // then
    expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
  });

  it('should load the correct icon', () => {
    // given
    const iconName = 'settings';

    // when
    const wrapper = shallowMount(Button, {
      props: {
        iconName,
      },
    });

    // then
    expect(wrapper.find('[data-test=button-icon]').attributes('name')).toBe(iconName);
  });
});
