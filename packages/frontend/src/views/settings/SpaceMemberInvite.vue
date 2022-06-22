<template>
  <Header :title="t('invite_new_member')" has-back />
  <AppContent>
    <form id="spaceMemberInviteForm" data-test="form" class="mx-4" @submit.prevent="inviteSpaceMember">
      <InputField icon-name="email">
        <TextField v-model="invitationForm.email" data-test="form-email" :placeholder="t('email_address')" />
      </InputField>

      <Button
        type="submit"
        form="spaceMemberInviteForm"
        :aria-label="t('invitation.send')"
        icon="send"
        class="w-full"
        :text="t('invitation.send').toLocaleUpperCase()"
      />

      <SelectableListItem
        :selected="invitationForm.role === 'user'"
        :label="t(`roles.user.name`)"
        :description="t(`roles.user.description`)"
        class="my-3"
        @click="invitationForm.role = 'user'"
      />
      <SelectableListItem
        :selected="invitationForm.role === 'admin'"
        :label="t(`roles.admin.name`)"
        :description="t(`roles.admin.description`)"
        class="my-3"
        @click="invitationForm.role = 'admin'"
      />
    </form>
  </AppContent>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Button from '~/components/buttons/Button.vue';
import Header from '~/components/headers/Header.vue';
import InputField from '~/components/InputField.vue';
import AppContent from '~/components/layout/AppContent.vue';
import SelectableListItem from '~/components/list-items/SelectableListItem.vue';
import TextField from '~/components/TextField.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import useFeathers from '~/compositions/useFeathers';

export default defineComponent({
  name: 'SpaceMemberInvite',

  components: { Header, InputField, TextField, SelectableListItem, AppContent, Button },

  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const feathers = useFeathers();
    const { spaceId } = useCurrentSpace();

    const invitationForm = ref<Partial<Model.Invitation>>({
      email: '',
      role: 'user',
    });

    const inviteSpaceMember = async () => {
      if (spaceId.value === null) {
        throw new Error('Unexpected: A space must be selected');
      }
      try {
        await feathers.service('invitations').create({
          email: invitationForm.value.email,
          role: invitationForm.value.role,
          spaceId: spaceId.value,
        });
        await router.replace({ name: 'settings-space-members', params: { spaceId: spaceId.value } });
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }
        if (error.message === 'User already in space') {
          alert(t('invitation.already_in_space'));
        } else if (error.message === 'email: value already exists.') {
          alert(t('invitation.already_invited'));
        } else {
          throw error;
        }
      }
    };

    return { inviteSpaceMember, invitationForm, t };
  },
});
</script>
