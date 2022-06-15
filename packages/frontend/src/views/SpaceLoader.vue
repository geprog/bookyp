<template>
  <router-view v-if="space" />
</template>

<script lang="ts" setup>
import { onMounted, provide, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { currentSpaceInjectionKey, spaceId } from '~/compositions/space/useCurrentSpace';
import { isSpaceAdmin } from '~/compositions/useAuthorization';
import useGet from '~/compositions/useGet';

const { data: space, error } = useGet('spaces', spaceId);

const router = useRouter();
const route = useRoute();

onMounted(() => {
  if (!spaceId.value) {
    void router.replace({ name: 'spaces-list' });
  }
});

const redirectOnUnauthorized = async () => {
  if (!space.value) {
    return;
  }
  if (!route.meta.accessibleByUserRole && !(await isSpaceAdmin(space.value))) {
    void router.replace({ name: 'home' });
  }
};
watch(route, redirectOnUnauthorized);
watch(space, redirectOnUnauthorized);

watch(error, () => {
  spaceId.value = null;
  void router.replace({ name: 'spaces-list' });
});

provide(currentSpaceInjectionKey, space);
</script>
