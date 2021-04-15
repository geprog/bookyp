<template>
  <div />
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'Callback',
  setup() {
    const router = useRouter();
    onMounted(() => {
      void router.push({ name: 'home' });
    });
  },
});
</script>
