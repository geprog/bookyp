<template>
  <form v-if="space" id="space" data-test="form" class="space" @submit.prevent="$emit('save')">
    <LabelField icon-name="home">
      <TextField v-model="spaceCreate.name" data-test="form-name" :placeholder="t('name')" />
    </LabelField>
    <LabelField icon-name="location">
      <TextField v-model="spaceCreate.address" data-test="form-address" :placeholder="t('address')" />
    </LabelField>
    <LabelField icon-name="text-box">
      <TextField v-model="spaceCreate.description" data-test="form-description" :placeholder="t('description')" />
    </LabelField>
    <LabelField icon-name="email">
      <TextField v-model="spaceCreate.email" :placeholder="t('email_space')" />
    </LabelField>
  </form>
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import { computed, reactive, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import LabelField from '~/components/LabelField.vue';
import TextField from '~/components/TextField.vue';

const props = defineProps<{
  space: Partial<Model.Space>;
}>();

const emit = defineEmits<{
  (event: 'update:space', _space: Partial<Model.Space>): void;
  (event: 'save'): void;
}>();

const { t } = useI18n();

const space = toRef(props, 'space');

const spaceCreate = reactive({
  name: computed({
    get() {
      return space.value.name || '';
    },
    set(name: string) {
      emit('update:space', { ...space.value, name });
    },
  }),
  address: computed({
    get() {
      return space.value.address || '';
    },
    set(address: string) {
      emit('update:space', { ...space.value, address });
    },
  }),
  description: computed({
    get() {
      return space.value.description || '';
    },
    set(description: string) {
      emit('update:space', { ...space.value, description });
    },
  }),
  email: computed({
    get() {
      return space.value.email || '';
    },
    set(email: string) {
      emit('update:space', { ...space.value, email });
    },
  }),
});
</script>
