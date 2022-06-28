<template>
  <div class="datepicker">
    <DatePicker
      v-model="dateTime"
      mode="dateTime"
      is24hr
      :minute-increment="15"
      :masks="masks"
      color="orange"
      :popover="{ visibility: 'focus' }"
      :min-date="internalMinDate"
      is-required
    >
      <template #default="{ inputValue, inputEvents }">
        <TextField :value="inputValue" :placeholder="placeholder" v-on="inputEvents" />
      </template>
    </DatePicker>
  </div>
</template>

<script lang="ts">
import dayjs, { ConfigType } from 'dayjs';
import { DatePicker } from 'v-calendar';
import { computed, defineComponent, PropType, toRef } from 'vue';

import TextField from '~/components/TextField.vue';

export default defineComponent({
  name: 'DateTimePicker',

  components: {
    DatePicker,
    TextField,
  },

  props: {
    modelValue: {
      type: [Object, String, Number] as PropType<ConfigType>,
      required: true,
    },

    placeholder: {
      type: String,
      default: '',
    },

    minDate: {
      type: [Object, String, Number] as PropType<ConfigType | null>,
      default: null,
    },
  },

  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    'update:modelValue': (__value: Date) => true,
  },

  setup(props, { emit }) {
    const modelValue = toRef(props, 'modelValue');
    const minDateProp = toRef(props, 'minDate');

    const dateTime = computed({
      get() {
        return dayjs(modelValue.value).toDate();
      },
      set(date: Date) {
        emit('update:modelValue', dayjs(date).toDate());
      },
    });

    const internalMinDate = computed(() => {
      if (minDateProp.value === null) {
        return null;
      }
      return dayjs(minDateProp.value).toDate();
    });

    return {
      dateTime,
      masks: {
        inputDateTime24hr: 'DD.MM.YYYY HH:mm',
      },

      internalMinDate,
    };
  },
});
</script>

<style scoped>
.datepicker ::v-deep(.vc-container) {
  --orange-600: #f59e0b; /* primary.normal from tailwind config */
}
</style>
