import { Meta, Story } from '@storybook/vue3';
import { ref } from 'vue';

import TabButton from '~/components/tabs/TabButton.vue';

export default {
  title: 'Components/Tabs',
  component: TabButton,
  argTypes: {
    selectedTab: { defaultValue: 1, control: { type: 'select', options: [1, 2] } },
  },
  args: {
    selectedTab: 1,
  },
} as Meta;

const tabTemplate = (id: number) =>
  `<TabButton v-bind="args" :active="selectedTab === ${id}"><span>Item ${id}</span></TabButton>`;

const Template: Story = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { TabButton },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    const selectedTab = ref((args as { selectedTab: number }).selectedTab);
    return { args, selectedTab };
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template: `<div class="flex">${tabTemplate(1)}${tabTemplate(2)}</div>`,
});

export const General = Template.bind({});
