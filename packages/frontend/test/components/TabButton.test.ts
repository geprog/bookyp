import { mount, shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';

import TabButton from '~/components/TabButton.vue';

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
    expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
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
    expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
  });

  it('should include content put into slot', () => {
    // given
    const content = '<p>Horst</p>';

    // when
    const wrapper = mount(TabButton, {
      slots: {
        default: content,
      },
    });

    // then
    expect(wrapper.html()).toContain(content);
  });
});
