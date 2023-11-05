<template>
  <Header :title="t('invite_new_member')" :back-fallback="{ name: 'settings-space-members' }" />
  <AppContent class="flex-col">
    <form
      id="spaceMemberInviteForm"
      data-test="form"
      class="flex flex-col gap-4 px-4 <md:py-12"
      @submit.prevent="inviteSpaceMember"
    >
      <LabelField icon-name="email">
        <TextField v-model="invitationForm.email" data-test="form-email" :placeholder="t('email_address')" />
      </LabelField>

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
        @click="invitationForm.role = 'user'"
      />
      <SelectableListItem
        :selected="invitationForm.role === 'admin'"
        :label="t(`roles.admin.name`)"
        :description="t(`roles.admin.description`)"
        @click="invitationForm.role = 'admin'"
      />
    </form>
  </AppContent>
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';

import Button from '~/components/buttons/Button.vue';
import Header from '~/components/headers/Header.vue';
import LabelField from '~/components/LabelField.vue';
import AppContent from '~/components/layout/AppContent.vue';
import SelectableListItem from '~/components/list-items/SelectableListItem.vue';
import TextField from '~/components/TextField.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { useBack } from '~/compositions/useBack';
import useFeathers from '~/compositions/useFeathers';

const { t } = useI18n();
const toast = useToast();
const feathers = useFeathers();
const { spaceId } = useCurrentSpace();
const { back } = useBack();

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
    void back({ name: 'settings-space-members' });
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }
    if (error.message === 'User already in space') {
      toast.error(t('invitation.already_in_space'));
    } else if (error.message === 'email: value already exists.') {
      toast.error(t('invitation.already_invited'));
    } else {
      throw error;
    }
  }
};
</script>
