import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

import icons from '~/assets/icons';
import Icon from '~/components/Icon.vue';

describe('Icon component', () => {
  function spyIcon(iconName: keyof typeof icons) {
    // the 3 lines below are a hack because we cannot spy on properties, only on getters, setters and methods
    const originalIcon = icons[iconName];
    Object.defineProperty(icons, iconName, { get: () => originalIcon });

    const iconSpy = jest.spyOn(icons, iconName, 'get');

    const resetIconSpy = () => {
      iconSpy.mockReset();

      // reset spy from above
      delete (icons as Partial<typeof icons>)[iconName];
      icons[iconName] = originalIcon;
    };

    return { resetIconSpy, iconSpy };
  }

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
    expect(icon.html()).toMatchSnapshot();
  });

  it('should use specified icon', () => {
    // given
    const iconName = 'add';
    const { resetIconSpy, iconSpy } = spyIcon(iconName);

    // when
    mount(Icon, {
      props: {
        name: iconName,
      },
    });

    // then
    expect(iconSpy).toHaveBeenCalledTimes(1);

    resetIconSpy();
  });

  it('should update icon on prop change', async () => {
    expect.assertions(2);
    // given
    const iconName = 'add';
    const changedIconName = 'link';
    const { resetIconSpy, iconSpy } = spyIcon(iconName);
    const { resetIconSpy: resetIconSpyChanged, iconSpy: iconSpyChanged } = spyIcon(iconName);
    const wrapper = mount(Icon, {
      props: {
        name: iconName,
      },
    });

    await nextTick();

    // when
    await wrapper.setProps({ name: changedIconName });

    // then
    expect(iconSpy).toHaveBeenCalledTimes(1);
    expect(iconSpyChanged).toHaveBeenCalledTimes(1);

    resetIconSpy();
    resetIconSpyChanged();
  });
});
