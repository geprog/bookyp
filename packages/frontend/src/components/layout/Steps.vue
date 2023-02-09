<template>
  <div>
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { provide, ref, toRef } from 'vue';

type Step = number;

const steps = ref<Step[]>([]);

const props = defineProps<{
  activeStep: number;
}>();

defineEmits<{
  (event: 'update:active-step', activeStep: number): void;
}>();

const activeStep = toRef(props, 'activeStep');

provide('activeStep', activeStep);

provide('registerStep', () => {
  const stepId = steps.value.length;
  steps.value = [...steps.value, stepId];
  return stepId;
});
</script>
