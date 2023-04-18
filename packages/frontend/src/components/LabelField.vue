<template>
  <div class="flex my-2 gap-4">
    <Icon class="my-2" :name="iconName" data-test="input-field-icon" />
    <div class="flex flex-col w-full py-2" :class="{ 'border-b-1': readonly === false }">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import Icon, { IconName } from '~/components/Icon.vue';

defineProps<{
  iconName: IconName;
  readonly?: boolean;
}>();
</script>
