<template>
  <NuxtPage v-if="space && !checking" />
  <AppContent v-else>
    <Spinner />
  </AppContent>
</template>

<script setup lang="ts">
/**
 * Parent of all pages inside a space: loads the space, remembers it as the current space
 * and guards the admin area. Child pages access the space with `useCurrentSpace()`.
 */
definePageMeta({ auth: 'ignored' });

const route = useRoute();
const { user, loaded } = useAuth();
const { rememberSpace, savedSpaceId } = useSavedSpace();
const { currentSpaceId, currentSpace, isAdmin } = useCurrentSpaceState();

// the route params are empty while the page is left, so the last id is kept until the page is unmounted
const spaceId = ref(route.params.spaceId as string);
watch(() => route.params.spaceId, (id) => {
  if (typeof id === 'string' && id) {
    spaceId.value = id;
  }
});
const { data: space, error } = useSpace(spaceId);

watch(spaceId, (id) => {
  currentSpaceId.value = id;
  rememberSpace(id);
}, { immediate: true });

watch(space, (value) => {
  currentSpace.value = value ?? null;
}, { immediate: true });

onBeforeUnmount(() => {
  currentSpaceId.value = null;
  currentSpace.value = null;
});

const checking = ref(true);

const spacePath = computed(() => `/space/${spaceId.value}`);
const isAdminRoute = computed(() => route.path.startsWith(`${spacePath.value}/settings`) || route.path.startsWith(`${spacePath.value}/bookings`));
const isBookingRoute = computed(() => route.path.startsWith(`${spacePath.value}/bookable/`));
// like v1 the admin area and the booking pages need a login, afterwards the user returns to the requested page
const needsLogin = computed(() => (isAdminRoute.value || isBookingRoute.value) && loaded.value && !user.value);

function redirectToLogin() {
  return navigateTo({ path: '/auth/login', query: { redirect: route.fullPath } }, { replace: true });
}

async function guard() {
  checking.value = true;
  if (!space.value) {
    return;
  }
  if (needsLogin.value) {
    await redirectToLogin();
    return;
  }
  const infoRoute = `${spacePath.value}/info`;
  // imported spaces and spaces that only show information redirect to the info page
  if ((space.value.importId || (space.value.bookingsAndRequests === 'only_info' && !isAdmin.value)) && route.path !== infoRoute) {
    await navigateTo(infoRoute, { replace: true });
    return;
  }
  if (isAdminRoute.value && !isAdmin.value) {
    await navigateTo(`${spacePath.value}/bookables/map`, { replace: true });
    return;
  }
  checking.value = false;
}

watch([space, () => route.path, user], () => void guard(), { immediate: true });

watch(error, (value) => {
  if (!value) {
    return;
  }
  // a private space is invisible without login (e.g. the link of a request mail)
  if (needsLogin.value) {
    void redirectToLogin();
    return;
  }
  savedSpaceId.value = null;
  void navigateTo('/spaces', { replace: true });
});
</script>
