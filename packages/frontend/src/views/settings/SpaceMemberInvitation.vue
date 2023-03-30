<template>
  <Header :title="t('invitation.edit')" :back-fallback="{ name: 'settings-space-members' }">
    <IconButton
      icon="delete"
      icon-color="text-red-text hover:text-red-background"
      data-test="icon"
      @click="removeInvitation"
    />
    <IconButton type="submit" form="spaceMemberInvitationForm" icon="save" />
  </Header>
  <AppContent>
    <form
      v-if="invitation !== undefined"
      id="spaceMemberInvitationForm"
      data-test="form"
      class="mx-4"
      @submit.prevent="saveInvitation"
    >
      <LabelField icon-name="email">
        <span>{{ invitation.email }}</span>
      </LabelField>

      <SelectableListItem
        :selected="invitation.role === 'user'"
        :label="t('roles.user.name')"
        :description="t('roles.user.description')"
        class="my-3"
        @click="invitation!.role = 'user'"
      />
      <SelectableListItem
        :selected="invitation.role === 'admin'"
        :label="t('roles.admin.name')"
        :description="t('roles.admin.description')"
        class="my-3"
        @click="invitation!.role = 'admin'"
      />
    </form>
  </AppContent>
</template>

<script lang="ts">
import { defineComponent, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import LabelField from '~/components/LabelField.vue';
import AppContent from '~/components/layout/AppContent.vue';
import SelectableListItem from '~/components/list-items/SelectableListItem.vue';
import { useBack } from '~/compositions/useBack';
import useFeathers from '~/compositions/useFeathers';
import useGet from '~/compositions/useGet';

export default defineComponent({
  name: 'SpaceMemberInvitation',

  components: { Header, IconButton, LabelField, SelectableListItem, AppContent },

  props: {
    invitationId: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const { t } = useI18n();
    const feathers = useFeathers();
    const { back } = useBack();
    const invitationId = toRef(props, 'invitationId');

    const { data: invitation } = useGet('invitations', invitationId);

    const saveInvitation = async () => {
      if (invitation.value === undefined) {
        throw new Error('Unexpected: An invitation must be loaded');
      }
      await feathers.service('invitations').update(invitationId.value, {
        ...invitation.value,
        role: invitation.value.role,
      });
      void back({ name: 'settings-space-members' });
    };

    async function removeInvitation(): Promise<void> {
      if (invitation.value === undefined) {
        throw new Error('Unexpected: An invitation must be loaded');
      }
      await feathers.service('invitations').remove(invitationId.value);
      void back({ name: 'settings-space-members' });
    }

    return { saveInvitation, removeInvitation, t, invitation };
  },
});
</script>
