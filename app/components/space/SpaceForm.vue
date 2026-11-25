<template>
  <form id="space" data-test="form" class="w-full pb-6 max-md:pt-12" @submit.prevent="emit('save')">
    <FormTextField v-model="form.name" class="py-2" icon="i-bookyp-home" data-test="form-name" :placeholder="t('name')" required />
    <RadioOption :name="t('scope.public')" :selected="form.isPublic === true" :hint="t('scope.public_space_hint')" class="py-4" @select="form.isPublic = true" />
    <RadioOption :name="t('scope.private')" :selected="form.isPublic === false" :hint="t('scope.private_space_hint')" class="pb-4" @select="form.isPublic = false" />

    <template v-if="!create">
      <FormTextField v-model="form.address" class="py-2" icon="i-bookyp-location" data-test="form-address" :placeholder="t('address')" :rows="4" />
      <div class="w-full pt-2 text-center text-sm text-gray-500">
        {{ t('select_location_on_map') }}
      </div>
      <div class="relative">
        <div ref="map" class="mb-2 h-64 w-full overflow-hidden rounded-md" />
        <FloatingButton
          v-if="form.coordinates"
          class="absolute top-2 right-2"
          background-color="white"
          data-test="clear-map-selection"
          icon="i-bookyp-delete"
          @click="form.coordinates = null"
        />
      </div>

      <FormTextField v-model="form.email" class="py-2" icon="i-bookyp-email" type="email" data-test="form-email" :placeholder="t('email_space')" />
      <FormTextField v-model="form.phone" class="py-2" icon="i-bookyp-phone" type="tel" data-test="form-phone" :placeholder="t('phone')" />
      <FormTextField v-model="form.website" class="py-2" icon="i-bookyp-website" data-test="form-website" :placeholder="t('website')" />
      <FormTextField v-model="form.description" class="py-2" icon="i-bookyp-text-box" data-test="form-description" :placeholder="t('edit_space_description')" />

      <template v-if="spaceId">
        <div class="w-full pt-2 text-center text-sm text-gray-500">
          {{ t('click_or_drag_and_drop_to_upload') }}
        </div>
        <div class="relative flex w-full flex-col overflow-hidden rounded-md border" :class="isOverDropZone ? 'border-amber-500' : 'border-gray-200'">
          <img v-if="imageUrl" :src="imageUrl" class="aspect-video w-full object-cover" alt="" data-test="space-image">
          <div v-else class="flex aspect-video w-full flex-col items-center justify-center gap-3">
            <UIcon name="i-bookyp-arrow-upload" class="size-6" />
            <span>{{ t('upload_space_image') }}</span>
          </div>
          <button ref="dropZone" type="button" class="absolute top-0 left-0 size-full" :aria-label="t('upload_space_image')" @click="fileInput?.click()" />
          <FloatingButton
            v-if="imageUrl"
            class="absolute top-2 right-2"
            background-color="white"
            data-test="clear-image"
            icon="i-bookyp-delete"
            @click="clearImage"
          />
        </div>
        <input ref="fileInput" type="file" class="hidden" accept="image/png,image/jpeg,image/gif,image/webp" @change="onUpload(($event.target as HTMLInputElement).files)">
      </template>
    </template>
  </form>
</template>

<script setup lang="ts">
import type { Coordinates } from '#shared/types/models';

export interface SpaceFormData {
  name: string;
  isPublic: boolean;
  address: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  coordinates: Coordinates | null;
}

/**
 * The form to create and edit a space, emitted with `save`. Like v1 a new or removed image is only staged
 * (`image`: a new file, `null` to remove it, `undefined` unchanged) and stored by the page on save.
 */
const props = defineProps<{
  modelValue: SpaceFormData;
  create?: boolean;
  /** id and image of the existing space (edit mode) */
  spaceId?: string;
  imageUrl?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: SpaceFormData];
  'save': [];
}>();

const image = defineModel<File | null | undefined>('image');

const { t } = useI18n();

const form = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
});

const coordinates = computed({
  get: () => form.value.coordinates,
  set: (value: Coordinates | null | undefined) => (form.value = { ...form.value, coordinates: value ?? null }),
});

const map = ref<HTMLElement>();
useMap({ coordinates, clickable: true, container: map });

const fileInput = ref<HTMLInputElement>();

/** preview of a staged image, the stored image otherwise */
const stagedImageUrl = ref<string>();
watch(image, (value) => {
  if (stagedImageUrl.value) {
    URL.revokeObjectURL(stagedImageUrl.value);
  }
  stagedImageUrl.value = value ? URL.createObjectURL(value) : undefined;
});
onBeforeUnmount(() => stagedImageUrl.value && URL.revokeObjectURL(stagedImageUrl.value));
const imageUrl = computed(() => (image.value === undefined ? props.imageUrl : stagedImageUrl.value));

function onUpload(files: FileList | File[] | null) {
  const file = files?.[0];
  if (file && props.spaceId) {
    image.value = file;
  }
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

function clearImage() {
  image.value = null;
}

const dropZone = ref<HTMLElement>();
const { isOverDropZone } = useDropZone(dropZone, { onDrop: files => onUpload(files) });
</script>
