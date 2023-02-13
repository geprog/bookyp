<template>
  <Header :title="t('confirmation.confirm_a_bookable', { bookable: bookable?.name })" has-back>
    <IconButton icon="check-mark" @click="$emit('submit')" />
  </Header>

  <AppContent>
    <div class="flex flex-col gap-4">
      <div class="mt-4 p-4 border-2 shadow-full border-gray-200 rounded flex gap-1">
        <Icon name="info" />
        <div>
          <p>{{ t('confirmation.confirm_booking_in_public_space') }}</p>
          <p>{{ t('confirmation.confirm_personal_data_warning') }}</p>
        </div>
      </div>
      <div class="flex flex-col gap-4">
        <LabelField v-if="currentSpace?.name" readonly icon-name="home">
          <TextField readonly :model-value="currentSpace?.name" />
        </LabelField>
        <LabelField v-if="currentSpace?.address" readonly icon-name="location">
          <TextField readonly :model-value="currentSpace?.address" />
        </LabelField>
        <LabelField v-if="currentSpace?.description" readonly icon-name="document-one-page">
          <TextField readonly :model-value="currentSpace?.description" />
        </LabelField>
        <LabelField v-if="currentSpace?.email" readonly icon-name="email">
          <TextField readonly :model-value="currentSpace?.email" />
        </LabelField>
        <LabelField readonly icon-name="play">
          <TextField readonly :model-value="start" />
        </LabelField>
        <LabelField readonly icon-name="stop">
          <TextField readonly :model-value="end" />
        </LabelField>
      </div>
    </div>
  </AppContent>
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import dayjs from 'dayjs';
import { computed, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import Icon from '~/components/Icon.vue';
import LabelField from '~/components/LabelField.vue';
import AppContent from '~/components/layout/AppContent.vue';
import TextField from '~/components/TextField.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import useGet from '~/compositions/useGet';

const props = defineProps<{
  booking?: Partial<Model.Booking>;
}>();

defineEmits<{ (event: 'submit'): void }>();

const { t } = useI18n();

const booking = toRef(props, 'booking');

const bookableId = computed(() => booking.value?.bookable);
const { data: bookable } = useGet('bookables', bookableId);

const { currentSpace } = useCurrentSpace();
const start = dayjs(booking.value?.start).format('DD.MM.YYYY HH:mm');
const end = dayjs(booking.value?.end).format('DD.MM.YYYY HH:mm');
</script>
