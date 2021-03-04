import { mount } from '@vue/test-utils';
import HelloWorld from '~/components/HelloWorld.vue';

describe('Hello-World component', () => {
  it('works', () => {
    const msg = 'It works!';

    const icon = mount(HelloWorld, {
      props: {
        msg,
      },
    });

    expect(icon.html().includes(msg)).toBe(true);
  });
});
