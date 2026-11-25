<template>
  <div v-if="space">
    <FormTextField v-if="space.name" :model-value="space.name" icon="i-bookyp-home" data-test="form-name" readonly />
    <FormTextField v-if="space.address" :model-value="space.address" icon="i-bookyp-location" data-test="space-address" readonly />
    <FormTextField v-if="'email' in space && space.email" :model-value="space.email" icon="i-bookyp-email" data-test="form-email" readonly />
    <FormTextField v-if="space.phone" :model-value="space.phone" icon="i-bookyp-phone" data-test="form-phone" readonly />
    <FormTextField v-if="space.website" :model-value="space.website" icon="i-bookyp-website" data-test="form-website" readonly />
    <FormTextField v-if="space.description" :model-value="space.description" icon="i-bookyp-text-box" data-test="space-description" readonly />

    <div v-if="space.coordinates" ref="map" class="mb-2 h-64 w-full overflow-hidden rounded-md" />
    <img v-if="space.imageUrl" :src="space.imageUrl" class="aspect-video w-full rounded-md object-cover" alt="">
  </div>
</template>

<script setup lang="ts">
import type { AnySpace } from '~/composables/useSpaces';

const props = defineProps<{ space?: AnySpace | null }>();

const coordinates = computed(() => props.space?.coordinates);
const map = ref<HTMLElement>();
useMap({ coordinates, followCoordinates: true, container: map });
</script>
