import Icon from '@bookyp/frontend/src/components/Icon.vue';
import { Meta, Story } from '@storybook/vue3';

const icons = ['add', 'arrow-left', 'check-mark', 'description', 'edit', 'settings'];

export default {
  title: 'Components/Icon',
  component: Icon,
  argTypes: {
    name: { defaultValue: 'add', control: { type: 'select', options: icons } },
  },
} as Meta;

const Template: Story = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { Icon },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    return { args };
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template: '<Icon v-bind="args" />',
});

export const General = Template.bind({});
