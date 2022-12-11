<template>
  <div>
    <div class="flex h-12 w-24">
      <button
        type="button"
        class="
          flex flex-col
          p-2
          w-12
          disabled:hover:bg-gray-background disabled:cursor-default disabled:text-gray-inactive
          items-center
          justify-center
          rounded-l-full
          hover:shadow-lg
        "
        :class="{
          'bg-primary-normal hover:bg-primary-dark text-white': primaryLeft,
          'hover:bg-gray-inactive bg-gray-background': !primaryLeft,
        }"
        :disabled="disabledLeft"
        @click.stop="$emit('left')"
      >
        <slot name="left"><Icon :name="iconLeft" data-test="icon-start" /></slot>
      </button>
      <button
        type="button"
        class="
          flex flex-col
          bg-gray-background
          hover:bg-gray-inactive
          disabled:hover:bg-gray-background disabled:cursor-default disabled:text-gray-inactive
          p-2
          w-12
          items-center
          justify-center
          rounded-r-full
          hover:shadow-lg
        "
        :disabled="disabledRight"
        @click.stop="$emit('right')"
      >
        <slot name="right"><Icon :name="iconRight" /></slot>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import icons from '~/assets/icons';
import Icon from '~/components/Icon.vue';

defineProps<{
  iconLeft: keyof typeof icons;
  iconRight: keyof typeof icons;
  disabledLeft?: boolean;
  disabledRight?: boolean;
  primaryLeft?: boolean;
}>();

defineEmits<{
  (event: 'left'): void;
  (event: 'right'): void;
}>();
</script>
