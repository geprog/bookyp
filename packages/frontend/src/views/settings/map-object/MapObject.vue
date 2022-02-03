<template>
  <Header
    :title="$route.name === 'settings-map-object' ? t('map_object.edit') : t('map_object.link_to_bookable')"
    has-back
  >
    <IconButton
      v-if="mapObject && $route.name === 'settings-map-object'"
      data-test="save-button"
      icon="check-mark"
      type="submit"
      @click="saveMapObject"
    />
  </Header>

  <div v-if="mapObject" class="flex flex-col mx-auto w-full max-w-lg p-3">
    <template v-if="$route.name === 'settings-map-object-link'">
      <SelectableListItem
        v-for="bookable in bookables"
        :key="bookable._id"
        :selected="mapObject.bookable === bookable._id"
        :label="bookable.name"
        data-test="select-bookable"
        class="cursor-pointer mb-3"
        @click="selectBookable(bookable)"
      />
    </template>

    <template v-else>
      <IconListItem
        v-if="linkedBookable"
        icon="link"
        :label="linkedBookable.name"
        data-test="linked-bookable"
        class="mb-3"
      >
        <template #end>
          <IconButton icon="delete" data-test="unlink-button" @click="unlinkBookable" />
        </template>
      </IconListItem>

      <Button
        icon="link"
        :text="
          mapObject.bookable
            ? t('map_object.change_bookable_link').toUpperCase()
            : t('map_object.link_to_bookable').toUpperCase()
        "
        @click="$router.push({ name: 'settings-map-object-link' })"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import { computed, defineComponent, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Button from '~/components/buttons/Button.vue';
import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import IconListItem from '~/components/list-items/IconListItem.vue';
import SelectableListItem from '~/components/list-items/SelectableListItem.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import useFeathers from '~/compositions/useFeathers';
import useFind from '~/compositions/useFind';
import useGet from '~/compositions/useGet';

export default defineComponent({
  name: 'MapObject',

  components: { IconButton, Header, Button, SelectableListItem, IconListItem },

  props: {
    mapObjectId: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const { t } = useI18n();
    const feathers = useFeathers();
    const router = useRouter();
    const { spaceId } = useCurrentSpace();

    const mapObjectId = toRef(props, 'mapObjectId');

    const { data: mapObject } = useGet('mapObjects', mapObjectId);

    const linkedBookableId = computed(() => mapObject.value?.bookable);
    const { data: linkedBookable } = useGet(
      'bookables',
      linkedBookableId,
      ref({ query: { $disableSoftDelete: true } }),
    );

    const { data: bookables } = useFind(
      'bookables',
      computed(() => ({ query: { space: spaceId.value } })),
    );

    async function saveMapObject(): Promise<void> {
      /* istanbul ignore next */
      if (!mapObject.value) {
        throw new Error('Unexpected: No map-object loaded');
      }

      await feathers.service('mapObjects').update(mapObject.value._id, mapObject.value);
      router.back();
    }

    function unlinkBookable() {
      /* istanbul ignore next */
      if (!mapObject.value) {
        throw new Error('Unexpected: No map-object loaded');
      }

      mapObject.value.bookable = undefined;
    }

    function selectBookable(bookable: Model.Bookable) {
      /* istanbul ignore next */
      if (!mapObject.value) {
        throw new Error('Unexpected: No map-object loaded');
      }

      mapObject.value.bookable = bookable._id;
      router.back();
    }

    return {
      t,
      saveMapObject,
      selectBookable,
      unlinkBookable,
      mapObject,
      bookables,
      linkedBookable,
    };
  },
});
</script>
