<template>
  <Header
    :title="t('bookyp')"
    :back-fallback="savedSpaceId ? { name: 'space', params: { spaceId: savedSpaceId } } : undefined"
  >
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
        @click="$router.push({ name: 'spaces-filter' })"
        >{{ appliedFilters }}</span
      >
      <IconButton
        icon="filter"
        :class="{ 'text-primary-normal': appliedFilters }"
        @click="$router.push({ name: 'spaces-filter' })"
      />
    </div>
    <template v-if="user">
      <IconButton
        data-test="button-account"
        icon="person"
        class="hidden md:block"
        @click="$router.push({ name: 'account-bookings' })"
      />
      <IconButton icon="sign-out" class="hidden md:block" @click="logout" />
    </template>

    <router-link v-else :to="{ name: 'auth-login' }" class="flex items-center gap-1">
      <span class="text-md">{{ $t('login') }}</span>
      <Icon name="log-in" />
    </router-link>
  </Header>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import Icon from '~/components/Icon.vue';
import { savedSpaceId } from '~/compositions/space/useCurrentSpace';
import { logout, user } from '~/compositions/useAuthentication';
import { useDateFilter } from '~/compositions/useDateFilter';

const { t } = useI18n();

const { hasActiveFilter } = useDateFilter();

const appliedFilters = computed(() => (hasActiveFilter.value ? 1 : 0));
</script>
