import { Meta, Story } from '@storybook/vue3';

import SelectableListItem from '~/components/list-items/SelectableListItem.vue';

export default {
  title: 'Components/List-items/SelectableListItem',
  component: SelectableListItem,
  args: {
    label: 'Label text',
    description: 'Description text',
  },
  argTypes: {
    selected: {
      defaultValue: false,
      control: { type: 'select', options: [true, false] },
    },
  },
} as Meta;

const Template: Story = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { SelectableListItem },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    return { args };
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template: '<SelectableListItem v-bind="args" />',
});

export const General = Template.bind({});
