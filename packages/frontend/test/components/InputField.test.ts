import { mount, shallowMount } from '@vue/test-utils';

import LabelField from '~/components/LabelField.vue';

describe('LabelField component', () => {
  it('should render correctly', () => {
    // given
    const iconName = 'settings';
    const content = '<p>Horst</p>';

    // when
    const wrapper = shallowMount(LabelField, {
      props: {
        iconName,
      },
      slots: {
        default: content,
      },
    });

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should include content put into slot', () => {
    // given
    const content = '<p>Horst</p>';

    // when
    const wrapper = mount(LabelField, {
      props: {
        iconName: 'document-one-page',
      },
      slots: {
        default: content,
      },
    });

    // then
    expect(wrapper.html()).toContain(content);
  });

  it('should load the correct icon', () => {
    // given
    const iconName = 'settings';

    // when
    const wrapper = shallowMount(LabelField, {
      props: {
        iconName,
      },
    });

    // then
    expect(wrapper.find('[data-test=input-field-icon]').attributes('name')).toBe(iconName);
  });
});
