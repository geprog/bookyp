<template>
  <div v-if="space">
    <LabelField v-if="space.name" icon-name="home">
      <TextField :model-value="space.name" readonly data-test="space-name" :placeholder="t('name')" />
    </LabelField>
    <LabelField v-if="space.address" icon-name="location">
      <TextField :model-value="space.address" readonly data-test="space-address" />
    </LabelField>
    <LabelField v-if="space.description" icon-name="text-box">
      <TextField
        :model-value="space.description"
        readonly
        data-test="space-description"
        :placeholder="t('description')"
      />
    </LabelField>
    <LabelField v-if="space.generalInformation" icon-name="text-box">
      <MarkdownViewer :source="space.generalInformation" data-test="space-general-information" />
    </LabelField>
    <LabelField v-if="space.email" icon-name="email">
      <TextField :model-value="space.email" readonly :placeholder="t('email_space')" />
    </LabelField>
    <div v-if="space.coordinates" ref="map" class="w-full h-64 mb-2 rounded-md overflow-hidden" />
    <img v-if="space.image" :src="space.image" class="w-full object-cover rounded-md aspect-video" />
  </div>
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import { computed, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import LabelField from '~/components/LabelField.vue';
import MarkdownViewer from '~/components/markdown/MarkdownViewer.vue';
import TextField from '~/components/TextField.vue';
import { useMap } from '~/compositions/useMap';

const { t } = useI18n();

const props = defineProps<{ space?: Model.Space }>();
const space = toRef(props, 'space');

const coordinates = computed(() => space.value?.coordinates);
const map = ref<HTMLElement>();
useMap({ coordinates, followCoordinates: ref(true), container: map });
</script>
