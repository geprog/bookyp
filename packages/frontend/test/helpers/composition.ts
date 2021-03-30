import { shallowMount } from '@vue/test-utils';

// eslint-disable-next-line promise/prefer-await-to-callbacks, @typescript-eslint/explicit-module-boundary-types
export const mountComposition = async (cb: () => void) => {
  const wrapper = shallowMount({
    setup() {
      // eslint-disable-next-line promise/prefer-await-to-callbacks
      cb();
      return {};
    },
    template: '<div />',
  });

  await wrapper.vm.$nextTick();

  return wrapper;
};
