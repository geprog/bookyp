<template>
  <Header :title="t('add_new_member')" has-back>
    <IconButton type="submit" form="spaceMemberForm" icon="save" />
  </Header>
  <form id="spaceMemberForm" data-test="form" class="mx-4" @submit.prevent="saveSpaceMember">
    <InputField icon-name="email">
      <TextField v-model="spaceUserForm.email" data-test="form-email" :placeholder="t('email_address')" />
    </InputField>
  </form>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import InputField from '~/components/InputField.vue';
import TextField from '~/components/TextField.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import useFeathers from '~/compositions/useFeathers';

export default defineComponent({
  name: 'SpaceMemberCreate',

  components: { Header, IconButton, InputField, TextField },

  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const feathers = useFeathers();
    const { spaceId } = useCurrentSpace();

    const spaceUserForm = ref<Partial<Model.SpaceMember>>({
      email: '',
    });

    const saveSpaceMember = async () => {
      if (spaceId.value === null) {
        throw new Error('Unexpected: A space must be selected');
      }
      try {
        await feathers.service('spaceMembers').create({
          email: spaceUserForm.value.email,
          spaceId: spaceId.value,
        });
        await router.push({ name: 'settings-space-members', params: { spaceId: spaceId.value } });
      } catch (error) {
        if (error instanceof Error && error.message === 'User not found') {
          alert(error.message);
        } else {
          throw error;
        }
      }
    };

    return { saveSpaceMember, spaceUserForm, t };
  },
});
</script>
