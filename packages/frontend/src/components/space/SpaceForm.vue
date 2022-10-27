<template>
  <form v-if="space" id="space" data-test="form" class="space" @submit.prevent="saveSpace">
    <InputField icon-name="home">
      <TextField v-model="spaceCreate.name" data-test="form-name" :placeholder="t('name')" />
    </InputField>
    <InputField icon-name="location">
      <TextField v-model="spaceCreate.address" data-test="form-address" :placeholder="t('address')" />
    </InputField>
    <InputField icon-name="text-box">
      <TextField v-model="spaceCreate.description" data-test="form-description" :placeholder="t('description')" />
    </InputField>
  </form>

  <div v-if="isEditingSpace" class="flex flex-col gap-y-6 mt-6 sm:max-w-xl <sm:max-w-xs mx-auto">
    <div class="flex flex-col p-4 border-primary-dark border-2 shadow-full text-center rounded-md">
      <h2 class="font-bold">{{ t('plan.plan') }}</h2>

      <template v-if="space.plan === 'public'">
        <p>{{ t('plan.public_plan_description') }}</p>

        <a :href="mailtoUpgrade" class="mx-auto mt-4">
          <Button :text="t('plan.change')" />
        </a>
      </template>
      <template v-else>
        <p>{{ t('plan.free_plan_description', { amountOfMembers: spaceMembers.length }) }}</p>

        <a :href="mailtoUpgrade" class="mx-auto mt-4">
          <Button :text="t('plan.upgrade')" />
        </a>
      </template>
    </div>

    <Button
      :aria-label="t('delete_space')"
      icon="delete"
      :text="t('delete_space').toLocaleUpperCase()"
      class="w-full"
      outlined
      @click="deleteSpace"
    />
  </div>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import { computed, defineComponent, PropType, reactive, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import Button from '~/components/buttons/Button.vue';
import InputField from '~/components/InputField.vue';
import TextField from '~/components/TextField.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';

export default defineComponent({
  name: 'SpaceForm',

  components: {
    InputField,
    TextField,
    Button,
  },

  props: {
    space: {
      type: Object as PropType<Partial<Model.Space>>,
      required: true,
    },
  },

  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    'update:space': (_space: Partial<Model.Space>) => true,
    save: () => true,
    delete: () => true,
  },

  setup(props, { emit }) {
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
    });

    const route = useRoute();
    const isEditingSpace = computed(() => route.name === 'settings-space-edit');
    const currentSpace = computed(() => {
      if (isEditingSpace.value) {
        return useCurrentSpace().currentSpace.value;
      }
      return undefined;
    });

    const spaceMembers = computed(() => currentSpace.value?.members || []);

    const saveSpace = () => {
      emit('save');
    };

    const mailtoUpgradeSubject = encodeURIComponent(`[${space.value?._id || ''}] Upgrade plan`);
    const mailtoUpgrade = `mailto:bookyp@geprog.com?subject=${mailtoUpgradeSubject}`;

    const deleteSpace = () => {
      emit('delete');
    };

    return { t, saveSpace, spaceCreate, spaceMembers, mailtoUpgrade, isEditingSpace, deleteSpace };
  },
});
</script>
