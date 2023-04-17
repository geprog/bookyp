import { shallowMount } from '@vue/test-utils';

import Button from '~/components/buttons/Button.vue';

describe('Button component', () => {
  it('should render correctly', () => {
    // given
    const icon = 'settings';
    const text = 'Submit';
    const iconEnd = 'settings';

    // when
    const wrapper = shallowMount(Button, {
      props: {
        text,
        icon,
        iconEnd,
      },
    });

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should load the correct text', () => {
    // given
    const text = 'Submit';

    // when
    const wrapper = shallowMount(Button, {
      props: {
        text,
      },
    });

    // then
    expect(wrapper.find('[data-test=button-text]').text()).toBe(text);
  });

  it('should load the correct icon', () => {
    // given
    const icon = 'settings';

    // when
    const wrapper = shallowMount(Button, {
      props: {
        icon,
      },
    });

    // then
    expect(wrapper.find('[data-test=button-icon]').attributes('name')).toBe(icon);
  });

  it('should load the correct end icon', () => {
    // given
    const iconEnd = 'settings';

    // when
    const wrapper = shallowMount(Button, {
      props: {
        iconEnd,
      },
    });

    // then
    expect(wrapper.find('[data-test=button-icon-end]').attributes('name')).toBe(iconEnd);
  });
});
