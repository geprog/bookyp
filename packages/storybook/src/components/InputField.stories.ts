import { Meta, Story } from '@storybook/vue3';

import Icons from '~/assets/icons';
import InputField from '~/components/InputField.vue';

const icons = [...Object.keys(Icons), null];

export default {
  title: 'Components/InputField',
  component: InputField,
  argTypes: {
    iconName: { defaultValue: 'description', control: { type: 'select', options: icons } },
    slotContent: { control: { type: 'text' } },
  },
  args: {
    slotContent: 'free to any content',
  },
} as Meta;

const Template: Story = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { InputField },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    return { args };
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template: '<InputField v-bind="args" >{{ args.slotContent }}</InputField>',
});

export const General = Template.bind({});
