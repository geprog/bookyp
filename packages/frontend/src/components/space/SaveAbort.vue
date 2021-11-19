<template>
  <IconButton data-test="abort-button" icon="dismiss" @click="$emit('abort')" />
  <IconButton data-test="save-button" type="submit" icon="check-mark" @click="$emit('save')" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import IconButton from '~/components/buttons/IconButton.vue';

export default defineComponent({
  name: 'SaveAbort',
  components: { IconButton },
  emits: {
    save: () => true,
    abort: () => true,
  },
});
</script>
