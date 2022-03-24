<template>
  <Header :title="t('add_new_member')" has-back>
    <IconButton type="submit" form="spaceMemberForm" icon="save" />
  </Header>
  <div class="w-full max-w-2xl mx-auto">
    <form id="spaceMemberForm" data-test="form" class="mx-4" @submit.prevent="saveSpaceMember">
      <InputField icon-name="email">
        <TextField v-model="spaceUserForm.email" data-test="form-email" :placeholder="t('email_address')" />
      </InputField>

      <SelectableListItem
        :selected="spaceUserForm.role === 'user'"
        :label="t(`roles.user.name`)"
        :description="t(`roles.user.description`)"
        class="my-3"
        @click="spaceUserForm.role = 'user'"
      />
      <SelectableListItem
        :selected="spaceUserForm.role === 'admin'"
        :label="t(`roles.admin.name`)"
        :description="t(`roles.admin.description`)"
        class="my-3"
        @click="spaceUserForm.role = 'admin'"
      />
    </form>
  </div>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import InputField from '~/components/InputField.vue';
import SelectableListItem from '~/components/list-items/SelectableListItem.vue';
import TextField from '~/components/TextField.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import useFeathers from '~/compositions/useFeathers';

export default defineComponent({
  name: 'SpaceMemberCreate',

  components: { Header, IconButton, InputField, TextField, SelectableListItem },

  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const feathers = useFeathers();
    const { spaceId } = useCurrentSpace();

    const spaceUserForm = ref<Partial<Model.SpaceMember>>({
      email: '',
      role: 'user',
    });

    const saveSpaceMember = async () => {
      if (spaceId.value === null) {
        throw new Error('Unexpected: A space must be selected');
      }
      try {
        await feathers.service('spaceMembers').create({
          email: spaceUserForm.value.email,
          role: spaceUserForm.value.role,
          spaceId: spaceId.value,
        });
        await router.replace({ name: 'settings-space-members', params: { spaceId: spaceId.value } });
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message === 'User not found' || error.message === 'User already in space')
        ) {
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
