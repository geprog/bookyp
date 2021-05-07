import Button from '@bookyp/frontend/src/components/buttons/Button.vue';
import { Meta, Story } from '@storybook/vue3';

const icons = ['add', 'arrow-left', 'check-mark', 'description', 'edit', 'settings', null];

export default {
  title: 'Components/Buttons/Button',
  component: Button,
  argTypes: {
    icon: { defaultValue: 'add', control: { type: 'select', options: icons } },
    text: { defaultValue: 'Submit', control: { type: 'text' } },
    iconEnd: { defaultValue: 'edit', control: { type: 'select', options: icons } },
  },
} as Meta;

const Template: Story = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { Button },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    return { args };
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template: '<Button v-bind="args" />',
});

export const General = Template.bind({});

export const Disabled = Template.bind({});
Disabled.args = { disabled: true };

export const StartIconOnly = Template.bind({});
StartIconOnly.args = { icon: 'add', iconEnd: null };

export const EndIconOnly = Template.bind({});
EndIconOnly.args = { icon: null, iconEnd: 'add' };

export const TextOnly = Template.bind({});
TextOnly.args = { icon: null, iconEnd: null };
