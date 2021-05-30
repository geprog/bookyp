<template>
  <ListItem :label="label" :description="description">
    <template #start>
      <Icon :name="icon" :color="iconColor" class="my-auto" data-test="icon" />
    </template>
    <slot />
  </ListItem>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Icon from '~/components/Icon.vue';
import ListItem from '~/components/list-items/ListItem.vue';
import { ExtractedComponentProp } from '~/vue-helpers';

export default defineComponent({
  name: 'IconListItem',

  components: { Icon, ListItem },

  props: {
    label: {
      type: String,
      default: '',
    },

    description: {
      type: String,
      default: '',
    },

    icon: {
      type: String as ExtractedComponentProp<typeof Icon, 'name'>,
      required: true,
    },

    iconColor: {
      type: String,
      default: null,
    },
  },
});
</script>
