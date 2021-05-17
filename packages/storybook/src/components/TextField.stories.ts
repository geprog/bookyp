import { Meta, Story } from '@storybook/vue3';

import TextField from '~/components/TextField.vue';

export default {
  title: 'Components/TextField',
  component: TextField,
} as Meta;

const Template: Story = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { TextField },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    return { args };
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template: '<TextField v-bind="args" />',
});

export const General = Template.bind({});

export const WithPlaceholder = Template.bind({});
WithPlaceholder.args = {
  placeholder: 'Placeholder text',
};
