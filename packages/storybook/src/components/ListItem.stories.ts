import ListItem from '@bookyp/frontend/src/components/ListItem.vue';
import { Meta, Story } from '@storybook/vue3';

export default {
  title: 'Components/ListItem',
  component: ListItem,
  args: {
    label: 'Label text',
    description: 'Description text',
  },
} as Meta;

const Template: Story = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { ListItem },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    return { args };
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template: '<ListItem v-bind="args" />',
});

export const General = Template.bind({});

export const SuccessItem = Template.bind({});
SuccessItem.args = {
  statusColor: 'bg-green-text',
};

export const CautionItem = Template.bind({});
CautionItem.args = {
  statusColor: 'bg-primary-normal',
};

export const ErrorItem = Template.bind({});
ErrorItem.args = {
  statusColor: 'bg-red-text',
};
