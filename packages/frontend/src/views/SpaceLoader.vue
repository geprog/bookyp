<template>
  <router-view v-if="space" />
</template>

<script lang="ts" setup>
import { provide, toRef, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { currentSpaceInjectionKey, savedSpaceId } from '~/compositions/space/useCurrentSpace';
import { isSpaceAdmin } from '~/compositions/useAuthorization';
import useGet from '~/compositions/useGet';

const props = defineProps<{ spaceId: string }>();
const spaceId = toRef(props, 'spaceId');

const { data: space, error } = useGet('spaces', spaceId);

const router = useRouter();
const route = useRoute();

watch(
  spaceId,
  (newSpaceId) => {
    savedSpaceId.value = newSpaceId;
  },
  { immediate: true },
);

const redirectOnImportedSpace = () => {
  if (!space.value) {
    return;
  }
  if (space.value.importId && route.name !== 'space-info' && route.matched.some((m) => m.name === 'space-loader')) {
    void router.replace({ name: 'space-info', params: { spaceId: space.value._id } });
  }
};

watch(space, redirectOnImportedSpace);
watch(route, redirectOnImportedSpace);

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
  savedSpaceId.value = null;
  void router.replace({ name: 'spaces-list' });
});

provide(currentSpaceInjectionKey, space);
</script>
