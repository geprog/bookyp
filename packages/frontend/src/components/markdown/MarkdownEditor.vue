<template>
  <span class="pb-2 text-gray-600">{{ $t('general_information') }}</span>
  <div class="flex flex-col border rounded-md border-gray-200 p-2">
    <div class="flex mb-2 border-b border-gray-200">
      <span
        class="cursor-pointer border-b-2 border-transparent pb-1 hover:border-gray-200 px-2"
        :class="{ 'border-gray-300': mode === 'write' }"
        @click="mode = 'write'"
        >{{ $t('write') }}</span
      >
      <span
        class="cursor-pointer border-b-2 border-transparent pb-1 hover:border-gray-200 px-2"
        :class="{ 'border-gray-300': mode === 'preview' }"
        @click="mode = 'preview'"
        >{{ $t('preview') }}</span
      >

      <div v-if="mode === 'write'" class="ml-auto">
        <markdown-toolbar for="textarea_id" class="flex">
          <md-bold><IconButton icon="bold" icon-color="text-gray-500 hover:text-primary-normal h-4 w-4" /></md-bold>
          <md-italic
            ><IconButton icon="italic" icon-color="text-gray-500 hover:text-primary-normal h-4 w-4"
          /></md-italic>
          <md-quote><IconButton icon="quote" icon-color="text-gray-500 hover:text-primary-normal h-4 w-4" /></md-quote>
          <md-code><IconButton icon="code" icon-color="text-gray-500 hover:text-primary-normal h-4 w-4" /></md-code>
          <md-link
            ><IconButton icon="format-link" icon-color="text-gray-500 hover:text-primary-normal h-4 w-4"
          /></md-link>
          <md-image><IconButton icon="image" icon-color="text-gray-500 hover:text-primary-normal h-4 w-4" /></md-image>
          <md-unordered-list
            ><IconButton icon="unordered-list" icon-color="text-gray-500 hover:text-primary-normal h-4 w-4"
          /></md-unordered-list>
          <md-ordered-list
            ><IconButton icon="ordered-list" icon-color="text-gray-500 hover:text-primary-normal h-4 w-4"
          /></md-ordered-list>
          <md-task-list
            ><IconButton icon="task-list" icon-color="text-gray-500 hover:text-primary-normal h-4 w-4"
          /></md-task-list>
        </markdown-toolbar>
      </div>
    </div>

    <div :style="{ minHeight: `${rows * 24 + 20}px` }" class="flex flex-col">
      <div v-if="mode === 'write'">
        <textarea
          id="textarea_id"
          v-model="value"
          v-bind="$attrs"
          :rows="rows"
          class="resize-none w-full outline-transparent py-0.7 px-0.25 border-b"
        />

        <i18n-t keypath="supports_markdown" tag="p" class="flex gap-1 text-sm">
          <ExternalLink href="https://www.markdownguide.org/basic-syntax" class="text-primary-normal">{{
            $t('markdown')
          }}</ExternalLink>
        </i18n-t>
      </div>
      <div v-else class="border border-transparent"><MarkdownViewer :source="value" /></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import '@github/markdown-toolbar-element';

import { computed, ref } from 'vue';

import ExternalLink from '~/components/buttons/ExternalLink.vue';
import IconButton from '~/components/buttons/IconButton.vue';

import MarkdownViewer from './MarkdownViewer.vue';

const props = defineProps<{
  modelValue: string;
}>();
const emit = defineEmits<{
  (event: 'update:modelValue', _modelValue: string): void;
}>();
const value = computed({
  get() {
    return props.modelValue;
  },
  set(newValue: string) {
    emit('update:modelValue', newValue);
  },
});
const mode = ref<'write' | 'preview'>('write');
const rows = computed(() => Math.max(5, value.value.split('\n').length));
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>
