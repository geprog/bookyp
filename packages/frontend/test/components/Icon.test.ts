import { mount } from '@vue/test-utils';
import Icon from '@/components/Icon.vue';

describe('Hello-World component', () => {
  it('works', () => {
    // given
    const iconName = 'It works!';

    // when
    const icon = mount(Icon, {
      props: {
        name: iconName,
      },
    });

    // then
    expect(icon.find('img').attributes('src')).toBe(`./src/assets/icons/${iconName}.svg`);
  });
});
