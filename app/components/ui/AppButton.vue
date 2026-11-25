<template>
  <component
    :is="to ? NuxtLink : href ? 'a' : 'button'"
    class="flex cursor-pointer items-center justify-center space-x-2 rounded-md border-2 px-4 py-2 text-base font-bold focus:outline-transparent disabled:cursor-not-allowed"
    :class="colorClasses"
    :to="to"
    :href="href"
    :disabled="disabled"
    :target="href ? '_blank' : undefined"
    :rel="href ? 'noopener noreferrer' : undefined"
    :type="!to && !href ? type : undefined"
    :form="form"
    @click="handleClick"
  >
    <Icon v-if="loading || running" name="progress" class="animate-spin" />
    <template v-else>
      <Icon v-if="icon" data-test="button-icon" :name="icon" :class="outlined ? 'text-inherit' : 'text-white'" />
      <span v-if="text || $slots.default" data-test="button-text"><slot>{{ text }}</slot></span>
      <Icon v-if="iconEnd" data-test="button-icon-end" :name="iconEnd" :class="outlined ? 'text-inherit' : 'text-white'" />
    </template>
  </component>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';
import { NuxtLink } from '#components';

/** the button of bookyp v1: solid orange or outlined, optionally with an icon on both sides */
const props = withDefaults(defineProps<{
  to?: RouteLocationRaw;
  href?: string;
  icon?: string;
  iconEnd?: string;
  text?: string;
  disabled?: boolean;
  outlined?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit';
  /** red for destructive actions (e.g. the confirm button of a delete dialog) */
  color?: 'primary' | 'error';
  form?: string;
  /** async action, the button shows a spinner while it runs */
  action?: () => void | Promise<void>;
}>(), {
  to: undefined,
  href: undefined,
  icon: undefined,
  iconEnd: undefined,
  text: undefined,
  type: 'button',
  color: 'primary',
  form: undefined,
  action: undefined,
});

const emit = defineEmits<{ click: [event: MouseEvent] }>();

const running = ref(false);

const colorClasses = computed(() => {
  if (props.outlined) {
    return props.color === 'error'
      ? 'border-red-500 text-red-500 hover:border-red-600 hover:text-red-600 disabled:border-gray-200 disabled:text-gray-200'
      : 'border-amber-500 text-amber-500 hover:border-amber-600 hover:text-amber-600 disabled:border-gray-200 disabled:text-gray-200';
  }
  return props.color === 'error'
    ? 'border-transparent bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-200'
    : 'border-transparent bg-amber-500 text-white hover:bg-amber-600 disabled:bg-gray-200';
});

async function handleClick(event: MouseEvent) {
  if (props.action) {
    running.value = true;
    try {
      await props.action();
    }
    finally {
      running.value = false;
    }
  }
  else {
    emit('click', event);
  }
}
</script>
