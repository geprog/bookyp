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

<script lang="ts" setup>
import dayjs, { ConfigType } from 'dayjs';
import { DatePicker } from 'v-calendar';
import { computed, toRef } from 'vue';

import TextField from '~/components/TextField.vue';

const props = withDefaults(
  defineProps<{
    modelValue: ConfigType | undefined;
    placeholder?: string;
    minDate?: ConfigType | null;
  }>(),
  {
    placeholder: '',
    minDate: null,
  },
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: Date | undefined): void;
}>();

const modelValue = toRef(props, 'modelValue');
const minDateProp = toRef(props, 'minDate');

const dateTime = computed({
  get() {
    return modelValue.value ? dayjs(modelValue.value).toDate() : undefined;
  },
  set(date: Date | undefined) {
    emit('update:modelValue', dayjs(date).toDate());
  },
});

const internalMinDate = computed(() => {
  if (minDateProp.value === null) {
    return null;
  }
  return dayjs(minDateProp.value).toDate();
});

const masks = {
  inputDateTime24hr: 'DD.MM.YYYY HH:mm',
};
</script>

<style scoped>
.datepicker ::v-deep(.vc-container) {
  --orange-600: #f59e0b; /* primary.normal from tailwind config */
}
</style>
