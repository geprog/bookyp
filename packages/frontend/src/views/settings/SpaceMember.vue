<template>
  <Header :title="t('edit_member')" has-back @click="$router.push({ name: 'settings-space-members' })">
    <IconButton
      icon="delete"
      icon-color="text-red-text hover:text-red-background"
      data-test="icon"
      @click="removeSpaceMember"
    />
    <IconButton type="submit" form="spaceMemberForm" icon="save" />
  </Header>
  <AppContent>
    <form
      v-if="spaceMember !== undefined"
      id="spaceMemberForm"
      data-test="form"
      class="mx-4"
      @submit.prevent="saveSpaceMember"
    >
      <LabelField icon-name="email">
        <span>{{ spaceMember.email }}</span>
      </LabelField>

      <SelectableListItem
        :selected="spaceMember.role === 'user'"
        :label="t('roles.user.name')"
        :description="t('roles.user.description')"
        class="my-3"
        @click="spaceMember!.role = 'user'"
      />
      <SelectableListItem
        :selected="spaceMember.role === 'admin'"
        :label="t('roles.admin.name')"
        :description="t('roles.admin.description')"
        class="my-3"
        @click="spaceMember!.role = 'admin'"
      />
    </form>
  </AppContent>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import { computed, defineComponent, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import LabelField from '~/components/LabelField.vue';
import AppContent from '~/components/layout/AppContent.vue';
import SelectableListItem from '~/components/list-items/SelectableListItem.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import useFeathers from '~/compositions/useFeathers';

export default defineComponent({
  name: 'SpaceMember',

  components: { Header, IconButton, LabelField, SelectableListItem, AppContent },

  props: {
    spaceMemberId: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const { t } = useI18n();
    const router = useRouter();
    const feathers = useFeathers();
    const { spaceId, currentSpace } = useCurrentSpace();
    const spaceMemberId = toRef(props, 'spaceMemberId');

    const spaceMemberIndex = computed(() =>
      (currentSpace.value?.members || []).findIndex((member) => member.userId === spaceMemberId.value),
    );

    const spaceMember = ref<Model.Member>();
    watch(
      currentSpace,
      () => {
        if (spaceMemberIndex.value !== undefined) {
          spaceMember.value = currentSpace.value?.members[spaceMemberIndex.value];
        }
      },
      { immediate: true },
    );

    const saveSpaceMember = async () => {
      if (currentSpace.value === undefined) {
        throw new Error('Unexpected: A space must be loaded');
      }
      if (spaceMemberIndex.value === undefined || spaceMember.value === undefined) {
        throw new Error('Unexpected: A space member must be loaded');
      }
      const members = currentSpace.value.members;
      const updatedMembers = [
        ...members.slice(0, spaceMemberIndex.value),
        spaceMember.value,
        ...members.slice(spaceMemberIndex.value + 1),
      ];
      await feathers.service('spaces').update(currentSpace.value._id, {
        ...currentSpace.value,
        members: updatedMembers,
      });
      await router.replace({ name: 'settings-space-members', params: { spaceId: spaceId.value } });
    };

    async function removeSpaceMember(): Promise<void> {
      if (currentSpace.value === undefined) {
        throw new Error('Unexpected: A space must be loaded');
      }
      if (spaceMemberIndex.value === undefined) {
        throw new Error('Unexpected: A space member must be loaded');
      }
      const members = currentSpace.value.members;
      await feathers.service('spaces').update(currentSpace.value._id, {
        ...currentSpace.value,
        members: [...members.slice(0, spaceMemberIndex.value), ...members.slice(spaceMemberIndex.value + 1)],
      });
      await router.replace({ name: 'settings-space-members', params: { spaceId: spaceId.value } });
    }

    return { saveSpaceMember, removeSpaceMember, t, spaceMember };
  },
});
</script>
