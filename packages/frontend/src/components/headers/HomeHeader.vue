<template>
  <Header :title="title" has-logo>
    <template #start>
      <router-link :to="{ name: 'spaces-list' }" data-test="spaces-button">
        <BookypIcon />
      </router-link>
    </template>
    <div class="relative">
      <span
        v-if="appliedFilters > 0"
        class="
          absolute
          left-4
          top-0.5
          bg-primary-normal
          rounded-full
          w-4
          h-4
          text-center text-xs text-white
          cursor-pointer
        "
        @click="$router.push({ name: 'bookables-filter' })"
        >{{ appliedFilters }}</span
      >
      <IconButton
        icon="filter"
        :class="{ 'text-primary-normal': appliedFilters }"
        @click="$router.push({ name: 'bookables-filter' })"
      />
    </div>

    <IconButton data-test="button-account" icon="person" @click="$router.push({ name: 'account-bookings' })" />
    <IconButton
      v-show="isAdmin"
      data-test="button-settings"
      icon="settings"
      :aria-label="t('settings')"
      @click="$router.push({ name: 'settings-space-map' })"
    />
  </Header>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import BookypIcon from '~/assets/icons/bookyp.svg?component';
import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { isSpaceAdmin } from '~/compositions/useAuthorization';
import { useBookables } from '~/compositions/useBookables';

export default defineComponent({
  name: 'HomeHeader',

  components: {
    Header,
    IconButton,
    BookypIcon,
  },

  setup() {
    const { t } = useI18n();

    const { currentSpace } = useCurrentSpace();

    const isAdmin = ref<boolean>(false);
    watch(
      currentSpace,
      async () => {
        if (currentSpace.value === undefined) {
          isAdmin.value = false;
          return;
        }
        isAdmin.value = await isSpaceAdmin(currentSpace.value);
      },
      { immediate: true },
    );

    const title = computed(() => currentSpace.value?.name || t('bookyp').toUpperCase());

    const { bookablesFilter } = useBookables();

    const appliedFilters = computed(() =>
      !bookablesFilter.value || bookablesFilter.value?.quickFilterEnabled ? 0 : 1,
    );

    return { t, isAdmin, title, appliedFilters };
  },
});
</script>
