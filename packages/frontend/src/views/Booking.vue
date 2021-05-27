<template>
  <Header :title="t('book_a_bookable', { bookable: bookable?.name })" has-back>
    <IconButton type="submit" form="booking" icon="check-mark" />
  </Header>
  <form id="booking" class="booking mx-4" @submit.prevent="submit">
    <InputField icon-name="play-circle">
      <TextField v-model="start" :placeholder="t('start')" />
    </InputField>
    <InputField icon-name="stop-circle">
      <TextField v-model="end" :placeholder="t('end')" />
    </InputField>
    <InputField icon-name="description">
      <TextField v-model="description" :placeholder="t('description')" />
    </InputField>
  </form>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import dayjs from 'dayjs';
import { defineComponent, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import InputField from '~/components/InputField.vue';
import TextField from '~/components/TextField.vue';
import { user } from '~/compositions/useAuthentication';
import useFeathers from '~/compositions/useFeathers';

export default defineComponent({
  name: 'Booking',

  components: { Header, IconButton, InputField, TextField },

  props: {
    bookableId: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const bookable = ref<Model.Bookable>();
    onMounted(async () => {
      // TODO: use composition that fixes loading edge cases
      bookable.value = await feathers.service('bookables').get(props.bookableId);
    });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();
    const router = useRouter();
    const feathers = useFeathers();

    const start = ref('');
    const end = ref('');
    const description = ref('');

    const submit = async () => {
      await feathers.service('bookings').create({
        start: dayjs(start.value).toDate(),
        end: dayjs(end.value).toDate(),
        description: description.value,
        bookable: props.bookableId,
        bookedBy: user.value?._id,
      });
      router.back();
    };

    return { submit, bookable, description, start, end, t };
  },
});
</script>
