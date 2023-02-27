<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="prose break-words" v-html="markup" />
  <slot />
</template>

<script lang="ts" setup>
import { marked } from 'marked';
import { computed, useSlots } from 'vue';

const slots = useSlots();

const props = defineProps<{
  source?: string;
}>();

const source = computed(() => {
  if (props.source) {
    return props.source;
  }

  if (!slots.default) {
    return '';
  }
  return slots.default().reduce((markdown, slot) => {
    if (typeof slot.children !== 'string') {
      return markdown;
    }
    return `${markdown}${slot.children.trim()}`;
  }, '');
});

const markup = computed(() => marked(source.value));
</script>
