<template>
  <Header :title="t('book_a_bookable', { bookable: bookable?.name })" has-back>
    <button type="submit" form="booking">
      <Icon name="check-mark" />
    </button>
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
import { Bookable } from '@bookyp/core/src/model';
import dayjs from 'dayjs';
import { defineComponent, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Header from '~/components/Header.vue';
import Icon from '~/components/Icon.vue';
import InputField from '~/components/InputField.vue';
import TextField from '~/components/TextField.vue';
import useFeathers from '~/compositions/useFeathers';

export default defineComponent({
  name: 'Booking',

  components: { Header, Icon, InputField, TextField },

  props: {
    bookableId: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const bookable = ref<Bookable>();
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
        bookedBy: '42d5573a-ff96-4e72-9f72-67b27712089d', // TODO: use actual user id
      });
      router.back();
    };

    return { submit, bookable, description, start, end, t };
  },
});
</script>
