import { mount, shallowMount } from '@vue/test-utils';

import IconListItem from '~/components/list-items/IconListItem.vue';

describe('IconListItem component', () => {
  it('should render correctly', () => {
    // given
    const label = 'title-value';
    const description = 'description';
    const icon = 'add';

    // when
    const wrapper = shallowMount(IconListItem, {
      props: {
        icon,
        label,
        description,
      },
    });

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should have an icon', () => {
    //given
    const icon = 'add';

    //when
    const wrapper = mount(IconListItem, {
      props: {
        icon,
      },
    });

    //then
    expect(wrapper.findComponent('[data-test=icon]').props('name')).toBe(icon);
  });
});
