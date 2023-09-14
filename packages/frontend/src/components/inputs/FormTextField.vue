<template>
  <LabelField :icon-name="icon" class="w-full" :readonly="readonly">
    <TextField
      v-model="innerValue"
      :data-test="dataTest"
      :placeholder="placeholder"
      :required="required"
      :rows="rows"
      :readonly="readonly"
    />
  </LabelField>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { IconName } from '~/components/Icon.vue';
import LabelField from '~/components/LabelField.vue';
import TextField from '~/components/TextField.vue';

const props = defineProps<{
  icon: IconName;
  modelValue: string;
  placeholder?: string;
  rows?: number;
  dataTest: string;
  required?: boolean;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void;
}>();

const innerValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value);
  },
});
</script>
