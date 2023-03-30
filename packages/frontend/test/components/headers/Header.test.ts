import { mount, shallowMount } from '@vue/test-utils';

import Header from '~/components/headers/Header.vue';

describe('Header component', () => {
  it('should render correctly', () => {
    // given
    const title = 'Home';

    // when
    const header = shallowMount(Header, {
      props: {
        title,
        hasBack: true,
      },
    });

    // then
    expect(header.html()).toMatchSnapshot();
  });

  it('should include content for right side', () => {
    // given
    const content = '<p>Horst</p>';

    // when
    const header = mount(Header, {
      props: {
        title: '',
      },
      slots: {
        default: content,
      },
    });

    // then
    expect(header.html()).toContain(content);
  });

  it('should include content for second row', () => {
    // given
    const content = '<p>Alice</p>';

    // when
    const header = mount(Header, {
      props: {
        title: '',
      },
      slots: {
        second: content,
      },
    });

    // then
    expect(header.html()).toContain(content);
  });

  it('should include a back button', () => {
    // given
    const backFallback = { name: 'test' };

    // when
    const header = shallowMount(Header, {
      props: {
        title: '',
        backFallback,
      },
    });

    // then
    expect(header.find('[data-test=back-button]').exists()).toBe(true);
  });

  it('should not include a back button', () => {
    // given

    // when
    const header = shallowMount(Header, {
      props: {
        title: '',
      },
    });

    // then
    expect(header.find('[data-test=back-button]').exists()).toBe(false);
  });

  it('should include the title text', () => {
    // given
    const title = 'Welcome to the Header!';

    // when
    const header = shallowMount(Header, {
      props: {
        title,
      },
    });

    // then
    expect(header.html()).toContain(title);
  });
});
