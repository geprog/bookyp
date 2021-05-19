import { shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';

import ToggleBar from '~/components/buttons/ToggleBar.vue';

describe('ToggleBar component', () => {
  it('should render correctly', () => {
    // given
    const icon = 'settings';

    // when
    const wrapper = shallowMount(ToggleBar, {
      props: {
        startIcon: icon,
        endIcon: icon,
      },
    });

    // then
    expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
  });

  it('should load the correct icons', () => {
    // given
    const startIcon = 'settings';
    const endIcon = 'add';

    // when
    const wrapper = shallowMount(ToggleBar, {
      props: {
        startIcon,
        endIcon,
      },
      global: {
        // stub needed due to caching issue. see https://github.com/vuejs/vue-test-utils-next/issues/530
        stubs: {
          Icon: {
            template: '<div></div>',
          },
        },
      },
    });

    // then
    expect(wrapper.find('[data-test=icon-start]').attributes('name')).toBe(startIcon);
    expect(wrapper.find('[data-test=icon-end]').attributes('name')).toBe(endIcon);
  });

  it('should highlight selected icon', () => {
    // given
    const startIcon = 'settings';
    const endIcon = 'add';
    const selected = 'end';

    // when
    const wrapper = shallowMount(ToggleBar, {
      props: {
        startIcon,
        endIcon,
        selected,
      },
    });

    // then
    expect(wrapper.find('.selected').attributes('data-test')).toBe(`button-${selected}`);
  });

  it('should emit selection', async () => {
    expect.assertions(3);

    // given
    const startIcon = 'settings';
    const endIcon = 'add';

    const wrapper = shallowMount(ToggleBar, {
      props: {
        startIcon,
        endIcon,
      },
    });

    // when
    await wrapper.find('[data-test=button-end]').trigger('click');
    await wrapper.find('[data-test=button-start]').trigger('click');

    // then
    expect(wrapper.emitted('update:selected')).toStrictEqual([['end'], ['start']]);
    expect(wrapper.emitted('selected-start')).toStrictEqual([[]]);
    expect(wrapper.emitted('selected-end')).toStrictEqual([[]]);
  });
});
