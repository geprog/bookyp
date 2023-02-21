<template>
  <Header has-back :title="t('space_information')" />
  <AppContent>
    <div v-if="space">
      <LabelField v-if="space.name" icon-name="home">
        <TextField v-model="space.name" readonly data-test="space-name" :placeholder="t('name')" />
      </LabelField>
      <LabelField v-if="space.address" icon-name="location">
        <TextField v-model="space.address" :rows="5" readonly data-test="space-address" />
      </LabelField>
      <LabelField v-if="space.description" icon-name="text-box">
        <TextField v-model="space.description" readonly data-test="space-description" :placeholder="t('description')" />
      </LabelField>
      <div v-if="space.coordinates" ref="map" class="w-full h-64 mb-2 rounded-md overflow-hidden" />
      <img v-if="space.image" :src="space.image" class="w-full object-cover rounded-md aspect-video" />
      <Button v-if="space.importId" :href="mailtoUpgrade">
        {{ t('claim_space') }}
      </Button>
    </div>
  </AppContent>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import Button from '~/components/buttons/Button.vue';
import Header from '~/components/headers/Header.vue';
import LabelField from '~/components/LabelField.vue';
import AppContent from '~/components/layout/AppContent.vue';
import TextField from '~/components/TextField.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { useMap } from '~/compositions/useMap';

const { t } = useI18n();

const { currentSpace: space } = useCurrentSpace();

const coordinates = computed(() => space.value?.coordinates);

const map = ref<HTMLElement>();
useMap({ coordinates, followCoordinates: ref(true), container: map });

const mailtoClaimSubject = encodeURIComponent(`[${space.value?._id || ''}] Claim Space`);
const mailtoUpgrade = `mailto:bookyp@geprog.com?subject=${mailtoClaimSubject}`;
</script>
