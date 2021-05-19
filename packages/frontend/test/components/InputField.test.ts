import { mount, shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';
import { h } from 'vue';

import InputField from '~/components/InputField.vue';

describe('InputField component', () => {
  it('should render correctly', () => {
    // given
    const iconName = 'settings';
    const content = '<p>Horst</p>';

    // when
    const wrapper = shallowMount(InputField, {
      props: {
        iconName,
      },
      slots: {
        default: content,
      },
    });

    // then
    expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
  });

  it('should include content put into slot', () => {
    // given
    // need to use h(...) instead of '<p>Horst</p>' due to https://github.com/vuejs/vue-test-utils-next/issues/549
    const content = h('p', {}, 'Horst');

    // when
    const wrapper = mount(InputField, {
      props: {
        iconName: 'description',
      },
      slots: {
        default: content,
      },
    });

    // then
    expect(wrapper.html()).toContain(content.el?.outerHTML);
  });

  it('should load the correct icon', () => {
    // given
    const iconName = 'settings';

    // when
    const wrapper = shallowMount(InputField, {
      props: {
        iconName,
      },
    });

    // then
    expect(wrapper.find('[data-test=input-field-icon]').attributes('name')).toBe(iconName);
  });
});
