<template>
  <Header :title="t('filter_bookables')" has-back>
    <IconButton type="submit" form="filterBookablesForm" icon="check-mark" />
  </Header>
  <form id="filterBookablesForm" class="my-2 mx-4" @submit.prevent="submitBookablesFilter">
    <InputField icon-name="play-circle">
      <DateTimePicker v-model="start" :placeholder="t('start')" />
    </InputField>
    <InputField icon-name="stop-circle">
      <DateTimePicker v-model="end" :placeholder="t('end')" />
    </InputField>
  </form>
</template>

<script lang="ts">
import dayjs from 'dayjs';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import InputField from '~/components/InputField.vue';
import DateTimePicker from '~/components/inputs/DateTimePicker.vue';
import { useBookablesFilter } from '~/compositions/useBookablesFilter';

export default defineComponent({
  name: 'BookablesFilter',

  components: { Header, IconButton, InputField, DateTimePicker },

  setup() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();
    const router = useRouter();
    const { bookablesFilter } = useBookablesFilter();

    const start = ref<Date>(bookablesFilter.value?.start || new Date());
    const end = ref<Date>(bookablesFilter.value?.end || new Date());

    const submitBookablesFilter = () => {
      bookablesFilter.value = { start: dayjs(start.value).toDate(), end: dayjs(end.value).toDate() };
      router.back();
    };

    return { t, submitBookablesFilter, start, end };
  },
});
</script>
