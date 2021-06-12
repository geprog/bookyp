import { Meta, Story } from '@storybook/vue3';

import Icons from '~/assets/icons';
import IconListItem from '~/components/list-items/IconListItem.vue';

const icons = [...Object.keys(Icons), null];

export default {
  title: 'Components/List-items/IconListItem',
  component: IconListItem,
  args: {
    label: 'Label text',
    description: 'Description text',
  },
  argTypes: {
    icon: {
      defaultValue: 'add',
      control: { type: 'select', options: icons },
    },
    iconColor: {
      defaultValue: '',
      control: { type: 'text' },
    },
  },
} as Meta;

const Template: Story = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { IconListItem },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    return { args };
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template:
    '<IconListItem v-bind="args" ><template v-if="args.endText" #end>{{ args.endText }}</template></IconListItem>',
});

export const General = Template.bind({});

export const WithEndSlot = Template.bind({});
WithEndSlot.args = {
  endText: 'end',
};
