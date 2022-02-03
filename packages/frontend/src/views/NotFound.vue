<template>
  <div class="not-found">
    <p>{{ t('not_found_message') }}</p>
    <router-link :to="{ name: 'home' }">{{ t('back_to_home') }}</router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'NotFound',

  setup() {
    const { t } = useI18n();
    return { t };
  },
});
</script>
