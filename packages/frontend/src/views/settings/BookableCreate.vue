<template>
  <Header :title="t('bookable_create')" has-back>
    <IconButton type="submit" form="bookable" icon="check-mark" />
  </Header>
  <AppContent>
    <BookableForm v-if="bookable" v-model:bookable="bookable" data-test="bookable-form" @save="saveBookable" />
  </AppContent>
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import { ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import BookableForm from '~/components/bookables/BookableForm.vue';
import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import AppContent from '~/components/layout/AppContent.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import useFeathers from '~/compositions/useFeathers';

const props = defineProps<{
  mapObject?: Model.MapObject;
}>();

const emit = defineEmits<{
  (event: 'update:mapObject', mapObject: Model.MapObject): void;
}>();

const mapObject = toRef(props, 'mapObject');

const { t } = useI18n();
const router = useRouter();
const feathers = useFeathers();
const { spaceId } = useCurrentSpace();

if (!spaceId.value) {
  throw new Error('Unexpected: A space must be selected');
}

const bookable = ref<Partial<Model.Bookable>>({
  description: '',
  name: '',
  space: spaceId.value,
});

const saveBookable = async () => {
  const createdBookable = await feathers.service('bookables').create(bookable.value);
  if (mapObject.value !== undefined) {
    emit('update:mapObject', { ...mapObject.value, link: { type: 'bookable', bookable: createdBookable._id } });
  }
  router.back();
};
</script>
