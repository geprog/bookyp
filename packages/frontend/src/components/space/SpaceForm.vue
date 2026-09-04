<template>
  <form
    v-if="space"
    id="space"
    data-test="form"
    class="space w-full pb-6 <md:pt-12"
    @submit.prevent="$emit('save', space)"
  >
    <FormTextField
      v-model="spaceCreate.name"
      class="py-2"
      icon="home"
      data-test="form-name"
      :placeholder="t('name')"
      required
    />
    <RadioButton
      :name="t('scope.public')"
      :value="spaceCreate.isPublic === true"
      :hint="t('scope.public_space_hint')"
      class="py-4"
      @update-value="spaceCreate.isPublic = true"
    />
    <RadioButton
      :name="t('scope.private')"
      :value="spaceCreate.isPublic === false"
      :hint="t('scope.private_space_hint')"
      class="pb-4"
      @update-value="spaceCreate.isPublic = false"
    />
    <template v-if="!create">
      <FormTextField
        v-model="spaceCreate.address"
        class="py-2"
        icon="location"
        data-test="form-address"
        :placeholder="t('address')"
        :rows="7"
      />
      <div class="w-full text-gray-500 text-center text-sm pt-2">
        {{ $t('select_location_on_map') }}
      </div>
      <div class="relative">
        <div ref="map" class="w-full h-64 mb-2 rounded-md overflow-hidden" />
        <FloatingButton
          v-if="coordinates"
          class="absolute fixed top-2 right-2"
          back-ground-color="white"
          data-test="clear-map-selection"
          icon="delete"
          @click="coordinates = null"
        />
      </div>

      <FormTextField
        v-model="spaceCreate.email"
        class="py-2"
        icon="email"
        data-test="form-email"
        :placeholder="t('email_space')"
      />
      <FormTextField
        v-model="spaceCreate.phone"
        class="py-2"
        icon="phone"
        data-test="form-phone"
        :placeholder="t('phone')"
      />
      <FormTextField
        v-model="spaceCreate.website"
        class="py-2"
        icon="website"
        data-test="form-website"
        :placeholder="t('website')"
      />
      <FormTextField
        v-model="spaceCreate.description"
        class="py-2"
        icon="text-box"
        data-test="form-description"
        :placeholder="t('edit_space_description')"
      />
      <div class="w-full text-gray-500 text-center text-sm pt-2">
        {{ $t('click_or_drag_and_drop_to_upload') }}
      </div>

      <div
        class="relative flex flex-col w-full border-1 rounded-md overflow-hidden"
        :class="{ 'border-primary-normal': isOverDropZone }"
      >
        <img v-if="imagePreviewUrl" :src="imagePreviewUrl" class="w-full object-cover aspect-video" />
        <div v-else class="w-full aspect-video flex flex-col gap-3 justify-center items-center">
          <Icon name="arrow-upload" />
          <span>{{ $t('upload_space_image') }}</span>
        </div>
        <button
          ref="dropZoneRef"
          type="button"
          class="absolute top-0 left-0 h-full w-full"
          @click="floorPlanFileInput?.click()"
        />

        <FloatingButton
          v-if="imagePreviewUrl"
          class="absolute fixed top-2 right-2"
          back-ground-color="white"
          data-test="clear-map-selection"
          icon="delete"
          @click="clearImage"
        />
      </div>
      <input
        ref="floorPlanFileInput"
        type="file"
        class="hidden"
        accept="image/*"
        @change="onUpload(($event.target as HTMLInputElement).files)"
      />
    </template>
  </form>
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import { useDropZone } from '@vueuse/core';
import { computed, reactive, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import FloatingButton from '~/components/buttons/FloatingButton.vue';
import Icon from '~/components/Icon.vue';
import FormTextField from '~/components/inputs/FormTextField.vue';
import RadioButton from '~/components/RadioButton.vue';
import useFeathers from '~/compositions/useFeathers';
import { useMap } from '~/compositions/useMap';

const props = defineProps<{
  space: Partial<Model.Space>;
  create?: boolean;
}>();

const emit = defineEmits<{
  (event: 'update:space', _space: Partial<Model.Space>): void;
  (event: 'save', space: Model.Space): void;
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
  email: computed({
    get() {
      return space.value.email || '';
    },
    set(email: string) {
      emit('update:space', { ...space.value, email });
    },
  }),
  imageKey: computed({
    get() {
      return space.value.imageKey;
    },
    set(imageKey?: string) {
      emit('update:space', { ...space.value, imageKey });
    },
  }),
  phone: computed({
    get() {
      return space.value.phone || '';
    },
    set(phone?: string) {
      emit('update:space', { ...space.value, phone });
    },
  }),
  website: computed({
    get() {
      return space.value.website || '';
    },
    set(website?: string) {
      emit('update:space', { ...space.value, website });
    },
  }),
  isPublic: computed({
    get() {
      return space.value.isPublic;
    },
    set(isPublic?: boolean) {
      emit('update:space', { ...space.value, isPublic });
    },
  }),
});

const coordinates = computed({
  get() {
    return space.value.coordinates;
  },
  set(_coordinates?: { lng: number; lat: number } | null) {
    emit('update:space', { ...space.value, coordinates: _coordinates });
  },
});

const map = ref<HTMLElement>();
useMap({ coordinates, clickable: ref(true), container: map });

const feathers = useFeathers();

const floorPlanFileInput = ref<HTMLInputElement>();

// the signed url of a freshly uploaded image, before the space has been saved
const uploadedImageUrl = ref<string>();

const imagePreviewUrl = computed(() =>
  spaceCreate.imageKey ? uploadedImageUrl.value || space.value.imageUrl : undefined,
);

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

  uploadedImageUrl.value = fileData.downloadUrl;
  spaceCreate.imageKey = fileData.fileKey;
}

function clearImage() {
  uploadedImageUrl.value = undefined;
  // an empty string instead of undefined, so the cleared value actually reaches the backend
  spaceCreate.imageKey = '';
}

const dropZoneRef = ref<HTMLElement>();
const { isOverDropZone } = useDropZone(dropZoneRef, (files) => void onUpload(files));
</script>
