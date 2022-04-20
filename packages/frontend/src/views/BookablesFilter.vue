<template>
  <Header :title="t('filter_bookables')" has-back>
    <IconButton type="submit" form="filterBookablesForm" icon="check-mark" />
  </Header>
  <form id="filterBookablesForm" class="my-2 mx-4" @submit.prevent="submitBookablesFilter">
    <div class="flex flex-row">
      <div class="flex flex-col flex-grow">
        <InputField icon-name="play">
          <DateTimePicker v-model="start" :placeholder="t('start')" />
        </InputField>
        <InputField icon-name="stop">
          <DateTimePicker v-model="end" :placeholder="t('end')" />
        </InputField>
      </div>
      <Button v-if="hasActiveBookablesFilter" icon="dismiss" outlined class="ml-4 px-1" @click="resetBookablesFilter" />
    </div>
  </form>
</template>

<script lang="ts">
import dayjs from 'dayjs';
import { computed, defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Button from '~/components/buttons/Button.vue';
import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import InputField from '~/components/InputField.vue';
import DateTimePicker from '~/components/inputs/DateTimePicker.vue';
import { useBookablesFilter } from '~/compositions/useBookablesFilter';

export default defineComponent({
  name: 'BookablesFilter',

  components: { Header, IconButton, InputField, DateTimePicker, Button },

  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const { bookablesFilter } = useBookablesFilter();

    const hasActiveBookablesFilter = computed(() => !!bookablesFilter.value);

    const start = ref<Date>(bookablesFilter.value?.start || new Date());

    const defaultEndDate = dayjs(start.value).add(2, 'hour').toDate();

    const end = ref<Date>(bookablesFilter.value?.end || defaultEndDate);

    const submitBookablesFilter = () => {
      bookablesFilter.value = { start: dayjs(start.value).toDate(), end: dayjs(end.value).toDate() };
      router.back();
    };

    const resetBookablesFilter = () => {
      bookablesFilter.value = undefined;
      router.back();
    };

    return { t, submitBookablesFilter, resetBookablesFilter, start, end, hasActiveBookablesFilter };
  },
});
</script>
