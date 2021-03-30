import FloatingButton from '@bookyp/frontend/src/components/FloatingButton.vue';
import { Meta, Story } from '@storybook/vue3';

const icons = ['add', 'arrow-left', 'check-mark', 'description', 'edit', 'settings'];

export default {
  title: 'Components/FloatingButton',
  component: FloatingButton,
  argTypes: {
    iconName: { defaultValue: 'add', control: { type: 'select', options: icons } },
  },
} as Meta;

const Template: Story = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { FloatingButton },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    return { args };
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template: '<FloatingButton v-bind="args" />',
});

export const General = Template.bind({});
