<template>
  <div class="fixed bottom-0 w-full flex justify-center items-end space-x-8 mb-4">
    <ToggleBar
      :selected="$route.name === 'bookables-map' ? 'start' : 'end'"
      start-icon="map"
      end-icon="apps-list"
      @selected-start="$router.replace({ name: 'bookables-map' })"
      @selected-end="$router.replace({ name: 'bookables-list' })"
    />

    <HourControlButton
      v-if="bookablesFilter && bookablesFilter.quickFilterEnabled"
      v-model:end-date="bookablesFilterEndDate"
    />
  </div>
</template>

<script lang="ts">
import dayjs from 'dayjs';
import { computed, defineComponent } from 'vue';

import HourControlButton from '~/components/buttons/HourControlButton.vue';
import ToggleBar from '~/components/buttons/ToggleBar.vue';
import { ceilDate, useBookables } from '~/compositions/useBookables';

export default defineComponent({
  name: 'HomeActionButtons',

  components: { ToggleBar, HourControlButton },

  setup() {
    const { bookablesFilter } = useBookables();

    const bookablesFilterEndDate = computed<Date>({
      get() {
        return bookablesFilter.value?.end || ceilDate(dayjs().add(2, 'hour').toDate(), 15, 'minutes');
      },
      set(value) {
        bookablesFilter.value = { ...bookablesFilter.value, end: ceilDate(value, 15, 'minutes') };
      },
    });

    return {
      bookablesFilterEndDate,
      bookablesFilter,
    };
  },
});
</script>
