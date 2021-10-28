import { Meta, Story } from '@storybook/vue3';

import DeleteDialog from '~/components/DeleteDialog.vue';

export default {
  title: 'Components/DeleteDialog',
  component: DeleteDialog,
  args: {
    label: 'Delete',
    description: 'Do you want to delete this booking?',
  },
  argTypes: {
    statusColor: {
      defaultValue: 'bg-primary-normal',
      control: { type: 'select', options: ['bg-gray-inactive', 'bg-green-text', 'bg-primary-normal', 'bg-red-text'] },
    },
    endText: {
      defaultValue: null,
      control: { type: 'text' },
    },
  },
} as Meta;

const Template: Story = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { DeleteDialog },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    return { args };
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template:
    '<DeleteDialog visible v-bind="args" ><template v-if="args.endText" #end>{{ args.endText }}</template></DeleteDialog>',
});

export const General = Template.bind({});

export const WithEndSlot = Template.bind({});
WithEndSlot.args = {
  endText: 'end',
};
