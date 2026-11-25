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
        <input
          type="text"
          class="min-h-6 w-full bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none"
          :value="inputValue"
          :placeholder="placeholder"
          :required="required"
          :data-test="dataTest"
          autocomplete="off"
          v-on="inputEvents"
        >
      </template>
    </DatePicker>
  </div>
</template>

<script setup lang="ts">
import type { DefineComponent } from 'vue';
import dayjs from 'dayjs';
import { DatePicker as VDatePicker } from 'v-calendar';

/** the date and time picker of v1 (v-calendar): a text field `DD.MM.YYYY HH:mm` that opens a calendar with a time selection on focus */
const props = withDefaults(defineProps<{
  modelValue?: Date | string;
  minDate?: Date | string | null;
  placeholder?: string;
  required?: boolean;
  dataTest?: string;
}>(), {
  modelValue: undefined,
  minDate: null,
  placeholder: '',
  dataTest: undefined,
});

const emit = defineEmits<{ 'update:modelValue': [value: Date] }>();

// the types of v-calendar 3 alpha do not describe the component props
const DatePicker = VDatePicker as unknown as DefineComponent<Record<string, unknown>>;

const dateTime = computed({
  get: () => (props.modelValue ? dayjs(props.modelValue).toDate() : undefined),
  set: (date: Date | undefined) => {
    emit('update:modelValue', dayjs(date).toDate());
  },
});

const internalMinDate = computed(() => (props.minDate ? dayjs(props.minDate).toDate() : null));

const masks = { inputDateTime24hr: 'DD.MM.YYYY HH:mm' };
</script>

<style scoped>
.datepicker :deep(.vc-container) {
  --orange-600: #f59e0b; /* the primary color of bookyp */
}
</style>
