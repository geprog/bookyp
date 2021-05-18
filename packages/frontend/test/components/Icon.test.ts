import { mount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';

import icons from '~/assets/icons';
import Icon from '~/components/Icon.vue';

describe('Icon component', () => {
  it('should render correctly', () => {
    // given
    const iconName = 'add';
    const color = 'text-gray-active';
    // when
    const icon = mount(Icon, {
      props: {
        name: iconName,
        color: color,
      },
    });

    // then
    expect(toDiffableHtml(icon.html())).toMatchSnapshot();
  });

  it('should use specified icon', () => {
    // given
    const iconName = 'add';
    // the 3 lines below are a hack because we cannot spy only on getters, setters and methods
    const originalIcon = icons[iconName];
    Object.defineProperty(icons, iconName, { get: () => originalIcon });
    const spy = jest.spyOn(icons, iconName, 'get');

    // when
    mount(Icon, {
      props: {
        name: iconName,
      },
    });

    // then
    expect(spy).toHaveBeenCalledWith();
    // reset spying-hack from above
    delete (icons as Partial<typeof icons>)[iconName];
    icons[iconName] = originalIcon;
  });
});
