<template>
  <IconListItem
    :label="label"
    :description="description"
    :icon="icon"
    :icon-color="selected ? 'text-primary-normal' : ''"
    :class="{ 'cursor-pointer': !selected || enableClickOnSelected, 'bg-primary-light': selected }"
    @click="$emit('update:selected', !selected)"
  />
</template>

<script lang="ts">
import { computed, defineComponent, toRef } from 'vue';

import IconListItem from '~/components/list-items/IconListItem.vue';

export default defineComponent({
  name: 'SelectableListItem',

  components: { IconListItem },

  props: {
    label: {
      type: String,
      default: '',
    },

    description: {
      type: String,
      default: '',
    },

    selected: {
      type: Boolean,
      required: true,
    },

    enableClickOnSelected: {
      type: Boolean,
    },
  },

  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    'update:selected': (_selected: boolean) => true,
  },

  setup(props) {
    const selected = toRef(props, 'selected');
    const icon = computed(() => (selected.value ? 'radio-checked' : 'radio-unchecked'));
    return { icon };
  },
});
</script>
