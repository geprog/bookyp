import { Meta, Story } from '@storybook/vue3';

import Icons from '~/assets/icons';
import ToggleBar from '~/components/buttons/ToggleBar.vue';

const icons = [...Object.keys(Icons), null];

export default {
  title: 'Components/ToggleBar',
  component: ToggleBar,
  argTypes: {
    startIcon: { defaultValue: 'add', control: { type: 'select', options: icons } },
    endIcon: { defaultValue: 'add', control: { type: 'select', options: icons } },
    selected: { defaultValue: 'start', control: { type: 'select', options: ['start', 'end'] } },
  },
} as Meta;

const Template: Story = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { ToggleBar },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    return { args };
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template: '<ToggleBar v-bind="args" />',
});

export const General = Template.bind({});
