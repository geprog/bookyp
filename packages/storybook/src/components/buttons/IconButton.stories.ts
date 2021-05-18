import { Meta, Story } from '@storybook/vue3';

import Icons from '~/assets/icons';
import IconButton from '~/components/buttons/IconButton.vue';

const icons = [...Object.keys(Icons), null];

export default {
  title: 'Components/Buttons/IconButton',
  component: IconButton,
  argTypes: {
    icon: { defaultValue: 'add', control: { type: 'select', options: icons } },
  },
} as Meta;

const Template: Story = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { IconButton },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    return { args };
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template: '<IconButton v-bind="args" />',
});

export const General = Template.bind({});

export const Disabled = Template.bind({});
Disabled.args = { disabled: true };
