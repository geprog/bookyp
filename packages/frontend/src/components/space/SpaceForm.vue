<template>
  <form v-if="space" id="space" data-test="form" class="space" @submit.prevent="$emit('save')">
    <LabelField icon-name="home">
      <TextField v-model="spaceCreate.name" data-test="form-name" :placeholder="t('name')" required />
    </LabelField>
    <LabelField icon-name="location">
      <TextField v-model="spaceCreate.address" :rows="5" data-test="form-address" :placeholder="t('address')" />
    </LabelField>
    <LabelField icon-name="text-box">
      <TextField v-model="spaceCreate.description" data-test="form-description" :placeholder="t('description')" />
    </LabelField>
    <LabelField icon-name="text-box">
      <MarkdownEditor
        v-model="spaceCreate.generalInformation"
        data-test="form-general-information"
        :placeholder="t('general_information')"
      />
    </LabelField>
    <LabelField icon-name="email">
      <TextField v-model="spaceCreate.email" :placeholder="t('email_space')" />
    </LabelField>

    <div ref="map" class="w-full h-64 mb-2 rounded-md overflow-hidden" />

    <div
      class="relative flex flex-col w-full border-1 rounded-md overflow-hidden"
      :class="{ 'border-primary-normal': isOverDropZone }"
    >
      <img v-if="spaceCreate.image" :src="spaceCreate.image" class="w-full object-cover aspect-video" />
      <div v-else class="w-full aspect-video flex flex-col gap-3 justify-center items-center">
        <Icon name="arrow-upload" />
        <span>{{ $t('upload_space_image') }}</span>
      </div>
      <div class="w-full text-gray-500 border-t-1 p-1">
        {{ $t('click_or_drag_and_drop_to_upload') }}
      </div>
      <button
        ref="dropZoneRef"
        type="button"
        class="absolute top-0 left-0 h-full w-full"
        @click="floorPlanFileInput?.click()"
      />
      <button
        v-if="spaceCreate.image"
        type="button"
        class="absolute bottom-1 right-1"
        :title="$t('delete')"
        @click="spaceCreate.image = ''"
      >
        <Icon name="delete" />
      </button>
    </div>
    <input
      ref="floorPlanFileInput"
      type="file"
      class="hidden"
      accept="image/*"
      @change="onUpload(($event.target as HTMLInputElement).files)"
    />
  </form>
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import { useDropZone } from '@vueuse/core';
import { computed, reactive, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import Icon from '~/components/Icon.vue';
import LabelField from '~/components/LabelField.vue';
import MarkdownEditor from '~/components/markdown/MarkdownEditor.vue';
import TextField from '~/components/TextField.vue';
import useFeathers from '~/compositions/useFeathers';
import { useMap } from '~/compositions/useMap';

const props = defineProps<{
  space: Partial<Model.Space>;
}>();

const emit = defineEmits<{
  (event: 'update:space', _space: Partial<Model.Space>): void;
  (event: 'save'): void;
}>();

const { t } = useI18n();

const space = toRef(props, 'space');

const spaceCreate = reactive({
  name: computed({
    get() {
      return space.value.name || '';
    },
    set(name: string) {
      emit('update:space', { ...space.value, name });
    },
  }),
  address: computed({
    get() {
      return space.value.address || '';
    },
    set(address: string) {
      emit('update:space', { ...space.value, address });
    },
  }),
  description: computed({
    get() {
      return space.value.description || '';
    },
    set(description: string) {
      emit('update:space', { ...space.value, description });
    },
  }),
  generalInformation: computed({
    get() {
      return space.value.generalInformation || '';
    },
    set(generalInformation: string) {
      emit('update:space', { ...space.value, generalInformation });
    },
  }),
  email: computed({
    get() {
      return space.value.email || '';
    },
    set(email: string) {
      emit('update:space', { ...space.value, email });
    },
  }),
  image: computed({
    get() {
      return space.value.image;
    },
    set(image?: string) {
      emit('update:space', { ...space.value, image });
    },
  }),
});

const coordinates = computed({
  get() {
    return space.value.coordinates;
  },
  set(_coordinates?: { lng: number; lat: number }) {
    emit('update:space', { ...space.value, coordinates: _coordinates });
  },
});

const map = ref<HTMLElement>();
useMap({ coordinates, clickable: ref(true), container: map });

const feathers = useFeathers();

const floorPlanFileInput = ref<HTMLInputElement>();

async function onUpload(files: File[] | FileList | null) {
  if (files === null || files.length !== 1) {
    return;
  }

  const file = files[0];

  const fileData = await feathers.service('upload-files').create({
    fileName: file.name,
    spaceId: space.value._id,
  });

  if (!fileData.uploadUrl) {
    return null;
  }

  const response = await fetch(fileData.uploadUrl, {
    method: 'PUT',
    body: file,
  });

  if (!response.ok) {
    return null;
  }

  spaceCreate.image = fileData?.downloadUrl;
}

const dropZoneRef = ref<HTMLElement>();
const { isOverDropZone } = useDropZone(dropZoneRef, (files) => void onUpload(files));
</script>
