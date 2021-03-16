<template>
  <input
    v-model="innerValue"
    class="w-full py-2 text-gray-900 placeholder-gray-600 border-b-1 focus:outline-none"
    type="text"
    :placeholder="placeholder"
  />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'TextField',

  components: {},

  props: {
    modelValue: {
      type: String,
      default: '',
    },

    placeholder: {
      type: String,
      default: '',
    },
  },

  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    'update:modelValue': (_value: string): boolean => true,
  },

  setup: (props, ctx) => {
    const innerValue = computed({
      get: () => props.modelValue,
      set: (value) => {
        ctx.emit('update:modelValue', value);
      },
    });
    return {
      innerValue,
    };
  },
});
</script>
