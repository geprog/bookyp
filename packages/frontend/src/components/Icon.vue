<template>
  <img :src="`./src/assets/icons/${name}.svg`" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Icon',

  props: {
    name: {
      type: String,
      required: true,
    },
  },

  setup() {
    return {};
  },
});
</script>
