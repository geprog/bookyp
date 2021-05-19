<template>
  <div
    class="flex h-12 w-24 cursor-pointer focus:outline-transparent disabled:bg-gray-background disabled:cursor-not-allowed"
  >
    <div
      class="flex flex-col p-2 w-12 items-center justify-center rounded-l-full shadow-lg"
      :class="{
        'selected bg-primary-normal text-white hover:bg-primary-dark': selected === 'start',
        'bg-gray-background text-gray-active_second hover:bg-gray-inactive': selected !== 'start',
      }"
      data-test="button-start"
      @click="select('start')"
    >
      <Icon :name="startIcon" data-test="icon-start" />
    </div>
    <div
      class="flex flex-col p-2 w-12 items-center justify-center rounded-r-full shadow-lg"
      :class="{
        'selected bg-primary-normal text-white hover:bg-primary-dark': selected === 'end',
        'bg-gray-background text-gray-active_second hover:bg-gray-inactive': selected !== 'end',
      }"
      data-test="button-end"
      @click="select('end')"
    >
      <Icon :name="endIcon" data-test="icon-end" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import Icon from '~/components/Icon.vue';
import { ExtractedComponentProp } from '~/vue-helpers';

export default defineComponent({
  name: 'ToggleBar',

  components: { Icon },

  props: {
    selected: {
      type: String as PropType<'start' | 'end'>,
      default: 'start',
    },

    startIcon: {
      type: String as ExtractedComponentProp<typeof Icon, 'name'>,
      required: true,
    },

    endIcon: {
      type: String as ExtractedComponentProp<typeof Icon, 'name'>,
      required: true,
    },
  },

  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    'update:selected': (_selected: string) => true,
    'selected-start': () => true,
    'selected-end': () => true,
  },

  setup(_, { emit }) {
    function select(selected: 'start' | 'end') {
      emit('update:selected', selected);

      if (selected === 'start') {
        emit('selected-start');
      } else {
        emit('selected-end');
      }
    }

    return {
      select,
    };
  },
});
</script>
