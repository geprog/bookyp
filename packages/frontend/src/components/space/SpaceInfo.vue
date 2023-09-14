<template>
  <div v-if="space">
    <FormTextField v-if="space.name" v-model="space.name" icon="home" data-test="form-name" readonly />
    <FormTextField v-if="space.address" v-model="space.address" icon="location" data-test="space-address" readonly />
    <FormTextField v-if="space.email" v-model="space.email" icon="email" data-test="form-email" readonly />
    <FormTextField v-if="space.phone" v-model="space.phone" icon="phone" data-test="form-phone" readonly />
    <FormTextField v-if="space.website" v-model="space.website" icon="website" data-test="form-website" readonly />

    <FormTextField
      v-if="space.description"
      v-model="space.description"
      icon="text-box"
      data-test="space-description"
      readonly
    />

    <div v-if="space.coordinates" ref="map" class="w-full h-64 mb-2 rounded-md overflow-hidden" />
    <img v-if="space.image" :src="space.image" class="w-full object-cover rounded-md aspect-video" />
  </div>
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import { computed, ref, toRef } from 'vue';

import FormTextField from '~/components/inputs/FormTextField.vue';
import { useMap } from '~/compositions/useMap';

const props = defineProps<{ space?: Model.Space }>();
const space = toRef(props, 'space');

const coordinates = computed(() => space.value?.coordinates);
const map = ref<HTMLElement>();
useMap({ coordinates, followCoordinates: ref(true), container: map });
</script>
