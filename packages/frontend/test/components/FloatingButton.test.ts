import { shallowMount } from '@vue/test-utils';

import FloatingButton from '~/components/FloatingButton.vue';

jest.mock('vue-router');

describe('FloatingButton component', () => {
  it('renders correctly', () => {
    // given
    const iconName = 'settings';

    // when
    const wrapper = shallowMount(FloatingButton, {
      props: {
        iconName,
      },
    });

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should load the correct icon', () => {
    // given
    const iconName = 'settings';

    // when
    const wrapper = shallowMount(FloatingButton, {
      props: {
        iconName,
      },
    });

    // then
    expect(wrapper.find('[data-test=floating-button-icon]').attributes('name')).toBe(iconName);
  });
});
