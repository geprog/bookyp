<template>
  <div class="flex mx-3 my-2 p-3 rounded-lg shadow-full bg-white">
    <slot name="start">
      <div :class="statusColor" class="w-2 rounded flex-shrink-0" />
    </slot>
    <slot>
      <div class="flex ml-3 flex-grow min-w-0">
        <div class="flex flex-col py-1 min-w-0 flex-grow space-y-1">
          <span v-if="label" data-test="label" class="text-base truncate">{{ label }}</span>
          <span v-if="description" data-test="description" class="w-full text-gray-700 text-sm truncate">{{
            description
          }}</span>
        </div>
        <div v-if="$slots.end" class="flex items-center ml-3">
          <slot name="end" />
        </div>
      </div>
    </slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ListItem',

  components: {},

  props: {
    label: {
      type: String,
      default: '',
    },

    statusColor: {
      type: String,
      default: 'bg-primary-normal',
    },

    description: {
      type: String,
      default: '',
    },
  },
});
</script>
