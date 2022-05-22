<template>
  <div class="fixed bottom-5 w-full flex justify-center items-end space-x-8">
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
import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from 'vue';

import HourControlButton from '~/components/buttons/HourControlButton.vue';
import ToggleBar from '~/components/buttons/ToggleBar.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { useBookablesFilter } from '~/compositions/useBookablesFilter';
import useFind from '~/compositions/useFind';

export default defineComponent({
  name: 'HomeActionButtons',

  components: { ToggleBar, HourControlButton },

  setup() {
    const { spaceId } = useCurrentSpace();

    const { data: bookables } = useFind(
      'bookables',
      computed(() => ({ paginate: false, query: { space: spaceId.value } })),
    );
    const { bookablesFilter } = useBookablesFilter(bookables);

    const bookablesFilterEndDate = computed<Date>({
      get() {
        return bookablesFilter.value?.end || dayjs().add(2, 'hour').toDate();
      },
      set(value) {
        bookablesFilter.value = { ...bookablesFilter.value, end: value };
      },
    });

    const startUpdateInterval = ref<ReturnType<typeof setTimeout>>();

    onMounted(() => {
      if (bookablesFilter.value === undefined) {
        bookablesFilter.value = {
          start: new Date(),
          end: dayjs().add(2, 'hour').toDate(),
          quickFilterEnabled: true,
        };
      }

      // update start of quick filter every minute. end date will be adjusted accordingly by watcher
      startUpdateInterval.value = setInterval(() => {
        if (!bookablesFilter.value?.quickFilterEnabled) {
          return;
        }

        bookablesFilter.value = {
          ...bookablesFilter.value,
          start: new Date(),
        };
      }, 1000 * 60);
    });

    onBeforeUnmount(() => {
      if (startUpdateInterval.value) {
        clearInterval(startUpdateInterval.value);
      }
    });

    return {
      bookablesFilterEndDate,
      bookablesFilter,
    };
  },
});
</script>
