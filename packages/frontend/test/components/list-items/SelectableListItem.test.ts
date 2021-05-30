import { mount, shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';

import SelectableListItem from '~/components/list-items/SelectableListItem.vue';

describe('SelectableListItem component', () => {
  it('should render correctly', () => {
    // given
    const label = 'title-value';
    const description = 'description';
    const selected = true;

    // when
    const wrapper = shallowMount(SelectableListItem, {
      props: {
        label,
        description,
        selected,
      },
    });

    // then
    expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
  });

  it('should invert selected on-click', async () => {
    expect.assertions(2);

    // given
    const selected = false;
    const wrapper = mount(SelectableListItem, {
      props: {
        selected,
      },
    });

    // when
    await wrapper.trigger('click');

    // then
    const emittedValues = wrapper.emitted()['update:selected'];
    expect(emittedValues).toHaveLength(1);
    expect(emittedValues[0]).toStrictEqual([!selected]);
  });

  describe('Selection', () => {
    it('should be selected', () => {
      // given
      const selected = true;

      // when
      const wrapper = mount(SelectableListItem, {
        props: {
          selected,
        },
      });

      //then
      expect(wrapper.findComponent('[data-test=icon]').props('name')).toBe('radio-checked');
    });

    it('should not be selected', () => {
      // given
      const selected = false;

      // when
      const wrapper = mount(SelectableListItem, {
        props: {
          selected,
        },
      });

      // then
      expect(wrapper.findComponent('[data-test=icon]').props('name')).toBe('radio-unchecked');
    });
  });
});
