<template>
  <div v-if="ownStepId !== undefined && activeStep === ownStepId">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { inject, onMounted, Ref, ref } from 'vue';

const registerStep = inject<() => number>('registerStep');
if (!registerStep) {
  throw new Error('Please wrap Step in Steps');
}

const activeStep = inject<Ref<number>>('activeStep');
if (!activeStep) {
  throw new Error('Please wrap Step in Steps');
}

const ownStepId = ref<number>();

onMounted(() => {
  ownStepId.value = registerStep();
});
</script>
