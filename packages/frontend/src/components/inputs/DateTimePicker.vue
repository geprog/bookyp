<template>
  <div class="datepicker">
    <DatePicker
      v-model="dateTime"
      mode="dateTime"
      is24hr
      :minute-increment="5"
      :masks="masks"
      color="orange"
      :popover="{ visibility: 'focus' }"
    >
      <template #default="{ inputValue, inputEvents }">
        <TextField :value="inputValue" :placeholder="placeholder" v-on="inputEvents" />
      </template>
    </DatePicker>
  </div>
</template>

<script lang="ts">
import { DatePicker } from 'v-calendar';
import { computed, defineComponent, toRef } from 'vue';

import TextField from '~/components/TextField.vue';

export default defineComponent({
  name: 'DateTimePicker',

  components: {
    DatePicker,
    TextField,
  },

  props: {
    // used by toRef
    // eslint-disable-next-line vue/no-unused-properties
    modelValue: {
      type: Date,
      default: new Date(),
    },

    placeholder: {
      type: String,
      default: '',
    },
  },

  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    'update:modelValue': (__value: Date) => true,
  },

  setup(props, { emit }) {
    const modelValue = toRef(props, 'modelValue');
    const dateTime = computed({
      get() {
        return modelValue.value;
      },
      set(date: Date) {
        emit('update:modelValue', date);
      },
    });

    return {
      dateTime,
      masks: {
        inputDateTime24hr: 'DD.MM.YYYY HH:mm',
      },
    };
  },
});
</script>

<style scoped>
.datepicker ::v-deep(.vc-container) {
  --orange-600: #f59e0b; /* primary.normal from tailwind config */
}
</style>
