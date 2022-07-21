<template>
  <div>
    <span class="text-center flex justify-center bg-white bg-opacity-75 rounded-lg">{{ t('next', { count }) }}</span>
    <ButtonPair icon-left="minus" icon-right="plus" @left="count > 1 && (count -= 1)" @right="count += 1" />
  </div>
</template>

<script lang="ts">
import dayjs from 'dayjs';
import { computed, defineComponent, PropType, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import ButtonPair from '~/components/buttons/ButtonPair.vue';

export default defineComponent({
  name: 'HourControlButton',

  components: { ButtonPair },

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
