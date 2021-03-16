import { mount, shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';

import Header from '~/components/Header.vue';

jest.mock('vue-router');

describe('Header component', () => {
  it('should render correctly', () => {
    // given
    const title = 'Home';

    // when
    const header = shallowMount(Header, {
      props: {
        title: title,
        hasBack: true,
      },
    });

    // then
    expect(toDiffableHtml(header.html())).toMatchSnapshot();
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
    const hasBack = true;

    // when
    const header = shallowMount(Header, {
      props: {
        title: '',
        hasBack,
      },
    });

    // then
    expect(header.find('[data-test=back-button]').exists()).toBe(true);
  });

  it('should not include a back button', () => {
    // given
    const hasBack = false;

    // when
    const header = shallowMount(Header, {
      props: {
        title: '',
        hasBack,
      },
    });

    // then
    expect(header.find('[data-test=back-button]').exists()).toBe(false);
  });

  it('should go back when pressing the back button', async () => {
    // given
    const { useRouter } = await import('vue-router');
    const router = useRouter();

    // when
    const header = shallowMount(Header, {
      props: {
        title: '',
        hasBack: true,
      },
    });
    header.find<HTMLElement>('*[data-test=back-button]').element.click();

    // then
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(router.go).toBeCalled();
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
