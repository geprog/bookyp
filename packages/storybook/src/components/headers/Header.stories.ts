import { Meta, Story } from '@storybook/vue3';

import Header from '~/components/headers/Header.vue';

export default {
  title: 'Components/Headers/Header',
  component: Header,
  args: {
    title: 'Header title',
  },
} as Meta;

const Template: Story = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { Header },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    return { args };
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template: '<Header v-bind="args" />',
});

export const General = Template.bind({});

export const WithBack = Template.bind({});
WithBack.args = {
  hasBack: true,
};
