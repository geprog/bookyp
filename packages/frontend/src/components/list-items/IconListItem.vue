<template>
  <ListItem :label="label" :description="description">
    <template #start>
      <Icon :name="icon" :color="iconColor" class="my-auto" />
    </template>
    <slot />
    <template #end>
      <slot name="end" />
    </template>
  </ListItem>
</template>

<script lang="ts" setup>
import Icon, { IconName } from '~/components/Icon.vue';
import ListItem from '~/components/list-items/ListItem.vue';

defineProps<{
  label?: string;
  description?: string;
  icon: IconName;
  iconColor?: string;
}>();
</script>
