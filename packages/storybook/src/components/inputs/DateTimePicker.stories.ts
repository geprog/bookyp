import { Meta, Story } from '@storybook/vue3';

import DateTimePicker from '~/components/inputs/DateTimePicker.vue';

export default {
  title: 'Components/Inputs/DateTimePicker',
  component: DateTimePicker,
  argTypes: {
    modelValue: { defaultValue: new Date(), control: { type: 'date' } },
  },
} as Meta;

const Template: Story = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { DateTimePicker },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    return { args };
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template: '<DateTimePicker v-bind="args" />',
});

export const General = Template.bind({});
