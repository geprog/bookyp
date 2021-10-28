<template>
  <div v-if="visible" class="absolute flex content-center justify-center left-0 top-0 right-0 bottom-0">
    <div class="absolute bg-gray-700 opacity-50 w-full h-full z-1" />
    <div class="flex flex-col flex-grow border-solid border-1 bg-white max-w-xl m-auto p-4.5 z-2">
      <div class="mb-5.5">
        <IconButton
          type="submit"
          from="visible"
          icon="cross"
          class="float-right justify-end"
          @click.prevent="$emit('confirmation', false)"
        />
        <span data-test="label" class="text-base text-2xl font-bold truncate">{{ t('message.label') }}</span>
      </div>
      <span data-test="description" class="w-full text-gray-700 text-sm truncate">{{ t('message.description') }}</span>
      <div class="flex flex-row gap-x-4 justify-end rounded-none pt-4">
        <Button class="flex" @click.prevent="$emit('confirmation', true)">{{ t('message.label') }}</Button>
        <Button @click.prevent="$emit('confirmation', false)">{{ t('message.cancel') }}</Button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

import Button from '~/components/buttons/Button.vue';

import IconButton from './buttons/IconButton.vue';

export default defineComponent({
  name: 'DeleteDialog',

  components: {
    Button,
    IconButton,
  },

  props: {
    visible: {
      type: Boolean,
    },
  },

  emits: ['confirmation'],

  setup() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();
    return { t };
  },
});
</script>
