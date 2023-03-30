<template>
  <component
    :is="to ? 'router-link' : href ? 'a' : 'button'"
    :class="{
      'flex items-center justify-center rounded-md px-4 py-2 space-x-2 text-md font-bold text-white cursor-pointer focus:outline-transparent disabled:cursor-not-allowed border-2': true,
      'border-primary-normal hover:border-primary-dark disabled:border-gray-background text-primary-normal hover:text-primary-dark disabled:text-gray-background':
        outlined,
      'border-transparent bg-primary-normal hover:bg-primary-dark disabled:bg-gray-background': !outlined,
    }"
    :to="to"
    :href="href"
    :disabled="disabled"
    :target="href && '_blank'"
    :rel="href && 'noopener noreferrer'"
    :type="!to && !href && 'button'"
    @click="handleClick"
  >
    <Icon v-if="loading || _loading" name="progress" class="animate-spin" />
    <template v-else>
      <Icon
        v-if="icon"
        data-test="button-icon"
        :class="{
          'text-inherit': outlined,
          'text-white': !outlined,
        }"
        :name="icon"
      />
      <slot>
        <span v-if="text" data-test="button-text">{{ text }}</span>
      </slot>
      <Icon
        v-if="iconEnd"
        data-test="button-icon-end"
        :class="{ 'text-inherit': outlined, 'text-white': !outlined }"
        :name="iconEnd"
      />
    </template>
  </component>
</template>

<script lang="ts" setup>
import { ref, toRef } from 'vue';
import { RouteLocationRaw } from 'vue-router';

import icons from '~/assets/icons';
import Icon from '~/components/Icon.vue';

const emit = defineEmits<{
  (event: 'click', mouse: MouseEvent): void;
}>();

const props = defineProps<{
  to?: RouteLocationRaw;
  href?: string;
  icon?: keyof typeof icons;
  iconEnd?: keyof typeof icons;
  text?: string;
  disabled?: boolean;
  outlined?: boolean;
  loading?: boolean;
  action?: () => void | Promise<void>;
}>();

const action = toRef(props, 'action');
const _loading = ref(false);

const handleClick = async (event: MouseEvent) => {
  if (action.value) {
    _loading.value = true;
    await action.value();
    _loading.value = false;
  } else {
    emit('click', event);
  }
};
</script>
