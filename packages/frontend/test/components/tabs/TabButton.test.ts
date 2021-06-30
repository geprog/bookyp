import { mount, shallowMount } from '@vue/test-utils';
import { h } from 'vue';

import TabButton from '~/components/tabs/TabButton.vue';

describe('TabButton component', () => {
  it('should render correctly when active', () => {
    // given
    const active = true;

    // when
    const wrapper = shallowMount(TabButton, {
      props: {
        active,
      },
    });

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should render correctly when not active', () => {
    // given
    const active = false;

    // when
    const wrapper = shallowMount(TabButton, {
      props: {
        active,
      },
    });

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should include content put into slot', () => {
    // given
    // need to use h(...) instead of '<p>Horst</p>' due to https://github.com/vuejs/vue-test-utils-next/issues/549
    const content = h('p', {}, 'Horst');

    // when
    const wrapper = mount(TabButton, {
      slots: {
        default: content,
      },
    });

    // then
    expect(wrapper.html()).toContain(content.el?.outerHTML);
  });
});
