import { shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';

import ListItem from '~/components/ListItem.vue';

describe('ListItem component', () => {
  it('should render correctly', () => {
    // given
    const label = 'title-value';
    const statusColor = 'color';
    const description = 'description';

    // when
    const wrapper = shallowMount(ListItem, {
      props: {
        label: label,
        statusColor: statusColor,
        description: description,
      },
    });

    // then
    expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
  });

  describe('Title', () => {
    it('should not have a title', () => {
      //when
      const wrapper = shallowMount(ListItem);

      //then
      expect(wrapper.find('[data-test="label"]').exists()).toBeFalsy();
    });

    it('should have a title', () => {
      //given
      const labelValue = 'label works!';

      //when
      const wrapper = shallowMount(ListItem, {
        props: {
          label: labelValue,
        },
      });

      //then
      expect(wrapper.find('[data-test="label"]').element.innerHTML).toBe(labelValue);
    });
  });

  describe('Status-color', () => {
    it('should have a status color', () => {
      //given
      const statusColor = 'ColorClass!';

      //when
      const wrapper = shallowMount(ListItem, {
        props: {
          statusColor: statusColor,
        },
      });

      //then
      const classCheck = wrapper.element.children.item(0)?.classList;
      expect(classCheck?.contains(statusColor)).toBe(true);
    });
  });

  describe('Description', () => {
    it('should not have a description', () => {
      //when
      const wrapper = shallowMount(ListItem);

      //then
      expect(wrapper.find('[data-test="description"]').exists()).toBeFalsy();
    });

    it('should have a description', () => {
      //given
      const description = 'description works!';

      //when
      const wrapper = shallowMount(ListItem, {
        props: {
          description: description,
        },
      });

      //then
      expect(wrapper.find('[data-test="description"]').element.innerHTML).toBe(description);
    });
  });
});
