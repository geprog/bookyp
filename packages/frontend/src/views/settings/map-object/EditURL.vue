<template>
  <Header :title="t('map_object.edit_link')" :back-fallback="{ name: 'settings-map-object' }" />

  <AppContent>
    <form class="flex flex-col mx-auto w-full py-3" @submit.prevent="updateLink">
      <LabelField icon-name="link">
        <TextField v-model="mapObjectLink" :placeholder="t('link_map_objects')" />
      </LabelField>
      <Button class="w-full" icon="link" :text="t('map_object.save_url').toUpperCase()" type="submit" />
    </form>
  </AppContent>
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import { ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import Button from '~/components/buttons/Button.vue';
import Header from '~/components/headers/Header.vue';
import LabelField from '~/components/LabelField.vue';
import AppContent from '~/components/layout/AppContent.vue';
import TextField from '~/components/TextField.vue';
import { back } from '~/compositions/useRouter';

const props = defineProps<{
  mapObject: Model.MapObject;
}>();

const emit = defineEmits<{
  (event: 'update:mapObject', mapObject: Model.MapObject): void;
}>();

const { t } = useI18n();

const mapObject = toRef(props, 'mapObject');

const mapObjectLink = ref('');

watch(
  mapObject,
  (_mapObject) => {
    if (_mapObject.link?.type === 'url') {
      mapObjectLink.value = _mapObject.link.url;
    }
  },
  { immediate: true },
);

function updateLink() {
  emit('update:mapObject', { ...mapObject.value, link: { type: 'url', url: mapObjectLink.value } });
  void back({ name: 'settings-map-object' });
}
</script>
