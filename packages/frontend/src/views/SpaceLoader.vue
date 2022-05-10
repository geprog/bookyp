<template>
  <router-view v-if="space" />
</template>

<script lang="ts" setup>
import { onMounted, provide, watch } from 'vue';
import { useRouter } from 'vue-router';

import { currentSpaceInjectionKey, spaceId } from '~/compositions/space/useCurrentSpace';
import useGet from '~/compositions/useGet';

const { data: space, error } = useGet('spaces', spaceId);

const router = useRouter();

onMounted(() => {
  if (!spaceId.value) {
    void router.replace({ name: 'spaces-list' });
  }
});

watch(error, () => {
  spaceId.value = null;
  void router.replace({ name: 'spaces-list' });
});

provide(currentSpaceInjectionKey, space);
</script>
