<template>
  <Header :title="t('select_office')" has-back />

  <div class="w-full max-w-2xl mx-auto">
    <div class="m-3">
      <Button
        :aria-label="t('space_create')"
        icon="add"
        :text="t('space_create').toLocaleUpperCase()"
        class="mt-3 w-full"
        @click="$router.push({ name: 'space-create' })"
      />
    </div>

    <template v-if="invitations.length > 0">
      <h2 class="m-3 font-bold">
        {{ t('invitation.pending_invitations') }}
      </h2>
      <ListItem
        v-for="invitation in invitations"
        :key="invitation._id"
        :description="t(`roles.${invitation.role}.name`)"
        :label="invitation.spaceName"
        class="m-3 relative"
      >
        <template #end>
          <IconButton icon="check-mark" @click="acceptInvitation(invitation._id)" />
          <IconButton icon="dismiss" @click="rejectInvitation(invitation._id)" />
        </template>
      </ListItem>

      <h2 class="m-3 font-bold">
        {{ t('spaces') }}
      </h2>
    </template>

    <SelectableListItem
      v-for="space in spaces"
      :key="space._id"
      :selected="spaceId === space._id"
      :label="space.name"
      :description="roleInSpace(space)"
      class="m-3"
      data-test="space-item"
      @click="changeSpace(space._id)"
    />
  </div>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import { computed, defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Button from '~/components/buttons/Button.vue';
import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import ListItem from '~/components/list-items/ListItem.vue';
import SelectableListItem from '~/components/list-items/SelectableListItem.vue';
import { spaceId } from '~/compositions/space/useCurrentSpace';
import { user } from '~/compositions/useAuthentication';
import useFeathers from '~/compositions/useFeathers';
import useFind from '~/compositions/useFind';

export default defineComponent({
  name: 'SpaceList',
  components: {
    Button,
    IconButton,
    ListItem,
    SelectableListItem,
    Header,
  },

  setup() {
    const { t } = useI18n();
    const feathers = useFeathers();
    const router = useRouter();

    const { data: spaces } = useFind(
      'spaces',
      computed(() => ({ paginate: false, query: { members: { $elemMatch: { userId: user.value?._id } } } })),
    );

    const { data: invitations } = useFind(
      'invitations',
      computed(() => (user.value === undefined ? null : { paginate: false, query: { email: user.value.email } })),
    );

    const roleInSpace = (space: Model.Space) =>
      space.members?.find((member) => member.userId === user.value?._id)?.role || 'user';

    const changeSpace = async (_spaceId: string) => {
      spaceId.value = _spaceId;
      await router.push({ name: 'home' });
    };

    function acceptInvitation(invitationId: string) {
      void feathers.service('invitations').remove(invitationId, { query: { accept: true } });
    }

    function rejectInvitation(invitationId: string) {
      void feathers.service('invitations').remove(invitationId);
    }

    return { t, spaces, roleInSpace, changeSpace, invitations, acceptInvitation, rejectInvitation, spaceId };
  },
});
</script>
