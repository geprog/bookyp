import { shallowMount } from '@vue/test-utils';

import ListItem from '~/components/list-items/ListItem.vue';

describe('ListItem component', () => {
  it('should render correctly', () => {
    // given
    const label = 'title-value';
    const statusColor = 'color';
    const description = 'description';

    // when
    const wrapper = shallowMount(ListItem, {
      props: {
        label,
        statusColor,
        description,
      },
    });

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });

  describe('Title', () => {
    it('should not have a title', () => {
      // when
      const wrapper = shallowMount(ListItem);

      // then
      expect(wrapper.find('[data-test="label"]').exists()).toBeFalsy();
    });

    it('should have a title', () => {
      // given
      const labelValue = 'label works!';

      // when
      const wrapper = shallowMount(ListItem, {
        props: {
          label: labelValue,
        },
      });

      // then
      expect(wrapper.find('[data-test="label"]').element.innerHTML).toBe(labelValue);
    });
  });

  describe('Status-color', () => {
    it('should have a status color', () => {
      // given
      const statusColor = 'test-status-color';

      // when
      const wrapper = shallowMount(ListItem, {
        props: {
          statusColor,
        },
      });

      // then
      expect(wrapper.find(`.${statusColor}`).exists()).toBeTruthy();
    });
  });

  describe('Description', () => {
    it('should not have a description', () => {
      // when
      const wrapper = shallowMount(ListItem);

      // then
      expect(wrapper.find('[data-test="description"]').exists()).toBeFalsy();
    });

    it('should have a description', () => {
      // given
      const description = 'description works!';

      // when
      const wrapper = shallowMount(ListItem, {
        props: {
          description,
        },
      });

      // then
      expect(wrapper.find('[data-test="description"]').element.innerHTML).toBe(description);
    });
  });
});
