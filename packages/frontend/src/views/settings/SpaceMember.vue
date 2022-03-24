<template>
  <Header :title="t('edit_member')" has-back>
    <IconButton
      icon="delete"
      icon-color="text-red-text hover:text-red-background"
      data-test="icon"
      @click="removeSpaceMember"
    />
    <IconButton type="submit" form="spaceMemberForm" icon="save" />
  </Header>
  <div class="w-full max-w-2xl mx-auto">
    <form
      v-if="spaceMember !== undefined"
      id="spaceMemberForm"
      data-test="form"
      class="mx-4"
      @submit.prevent="saveSpaceMember"
    >
      <InputField icon-name="email">
        <span>{{ spaceMember.email }}</span>
      </InputField>

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
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import InputField from '~/components/InputField.vue';
import SelectableListItem from '~/components/list-items/SelectableListItem.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import useFeathers from '~/compositions/useFeathers';
import useGet from '~/compositions/useGet';

export default defineComponent({
  name: 'SpaceMember',

  components: { Header, IconButton, InputField, SelectableListItem },

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
    const { spaceId } = useCurrentSpace();
    const spaceMemberId = toRef(props, 'spaceMemberId');

    const { data: spaceMember } = useGet(
      'spaceMembers',
      spaceMemberId,
      computed(() => {
        if (spaceId.value === null) {
          return undefined;
        }
        return { query: { spaceId: spaceId.value } };
      }),
    );

    const saveSpaceMember = async () => {
      if (spaceId.value === null) {
        throw new Error('Unexpected: A space must be selected');
      }
      if (spaceMember.value === undefined) {
        throw new Error('Unexpected: A space member must be loaded');
      }
      await feathers.service('spaceMembers').update(spaceMemberId.value, {
        role: spaceMember.value.role,
        spaceId: spaceId.value,
      });
      await router.replace({ name: 'settings-space-members', params: { spaceId: spaceId.value } });
    };

    async function removeSpaceMember(): Promise<void> {
      if (spaceMember.value === undefined) {
        throw new Error('Unexpected: A space member must be loaded');
      }
      await feathers.service('spaceMembers').remove(spaceMember.value.userId, { query: { spaceId: spaceId.value } });
      await router.replace({ name: 'settings-space-members', params: { spaceId: spaceId.value } });
    }

    return { saveSpaceMember, removeSpaceMember, t, spaceMember };
  },
});
</script>
