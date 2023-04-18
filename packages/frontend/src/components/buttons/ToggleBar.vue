<template>
  <div
    class="
      flex
      h-12
      w-24
      cursor-pointer
      focus:outline-transparent
      disabled:bg-gray-background disabled:cursor-not-allowed
    "
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

<script lang="ts" setup>
import Icon, { IconName } from '~/components/Icon.vue';

const emit = defineEmits<{
  (event: 'update:selected', selected: 'start' | 'end'): void;
  (event: 'selected-start'): void;
  (event: 'selected-end'): void;
}>();

withDefaults(
  defineProps<{
    selected?: 'start' | 'end';
    startIcon: IconName;
    endIcon: IconName;
  }>(),
  {
    selected: 'start',
  },
);

function select(selected: 'start' | 'end') {
  emit('update:selected', selected);

  if (selected === 'start') {
    emit('selected-start');
  } else {
    emit('selected-end');
  }
}
</script>
