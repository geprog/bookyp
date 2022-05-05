<template>
  <div>
    <span class="text-center flex justify-center">{{ t('next', { count }) }}</span>
    <div
      class="
        flex
        h-12
        w-24
        cursor-pointer
        focus:outline-transparent
        disabled:bg-gray-background disabled:cursor-not-allowed
      "
    >
      <div
        class="
          flex flex-col
          p-2
          w-12
          hover:bg-gray-inactive
          focus:bg-red-background
          bg-gray-background
          items-center
          justify-center
          rounded-l-full
          hover:shadow-lg
        "
        @click="count > 1 && (count -= 1)"
      >
        <Icon name="minus" data-test="icon-start" />
      </div>
      <div
        class="
          flex flex-col
          bg-gray-background
          hover:bg-gray-inactive
          p-2
          w-12
          items-center
          justify-center
          rounded-r-full
          hover:shadow-lg
        "
        @click="count += 1"
      >
        <Icon name="plus" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import dayjs from 'dayjs';
import { computed, defineComponent, PropType, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import Icon from '~/components/Icon.vue';

export default defineComponent({
  name: 'HourControlButton',

  components: { Icon },

  props: {
    endDate: {
      type: Object as PropType<Date>,
      required: true,
    },
  },

  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    'update:endDate': (_endDate: Date) => true,
  },

  setup(props, { emit }) {
    const { t } = useI18n();
    const endDate = toRef(props, 'endDate');

    const count = computed<number>({
      get() {
        // subtract 1 minute to solve time adjustment
        return dayjs(endDate.value).diff(dayjs().subtract(1, 'minute'), 'hours');
      },
      set(value) {
        emit('update:endDate', dayjs().add(value, 'hours').toDate());
      },
    });

    return {
      count,
      t,
    };
  },
});
</script>
