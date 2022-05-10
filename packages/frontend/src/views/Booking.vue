<template>
  <Header :title="t('book_a_bookable', { bookable: bookable?.name })" has-back>
    <IconButton type="submit" form="booking" icon="check-mark" />
  </Header>

  <form id="booking" class="booking px-4" @submit.prevent="submit">
    <InputField icon-name="document-one-page">
      <TextField v-model="description" :placeholder="t('description')" />
    </InputField>

    <DateRangePicker v-model:start="start" v-model:end="end" :bookings="bookings" />
  </form>
</template>

<script lang="ts">
import dayjs from 'dayjs';
import { computed, defineComponent, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import InputField from '~/components/InputField.vue';
import DateRangePicker from '~/components/inputs/DateRangePicker.vue';
import TextField from '~/components/TextField.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { user } from '~/compositions/useAuthentication';
import { useBookablesFilter } from '~/compositions/useBookablesFilter';
import useFeathers from '~/compositions/useFeathers';
import useFind from '~/compositions/useFind';
import useGet from '~/compositions/useGet';

export default defineComponent({
  name: 'Booking',

  components: { Header, IconButton, InputField, TextField, DateRangePicker },

  props: {
    bookableId: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const { t } = useI18n();
    const router = useRouter();
    const feathers = useFeathers();
    const { spaceId } = useCurrentSpace();
    const { bookablesFilter } = useBookablesFilter();

    const bookableId = toRef(props, 'bookableId');
    const { data: bookable } = useGet('bookables', bookableId);

    const { data: bookings } = useFind(
      'bookings',
      computed(() => ({
        query: {
          bookable: bookableId.value,
        },
      })),
    );

    const start = ref(bookablesFilter.value?.start || new Date());
    const end = ref(bookablesFilter.value?.end || dayjs().add(1, 'hour').toDate());

    const description = ref('');

    const submit = async () => {
      /* istanbul ignore next */
      if (!user.value) {
        throw new Error('Unexpected: User should be loaded');
      }

      if (!spaceId.value) {
        throw new Error('Unexpected: A space must be selected');
      }

      try {
        await feathers.service('bookings').create({
          start: start.value,
          end: end.value,
          description: description.value,
          bookable: props.bookableId,
          bookedBy: user.value._id,
          space: spaceId.value,
        });
        bookablesFilter.value = undefined;
        await router.replace({ name: 'account-bookings' });
      } catch (error) {
        if (error instanceof Error && error.message === 'Booking overlaps with existing bookings') {
          alert(t('booking_overlaps', { bookable: bookable.value?.name }));
          return;
        }
        throw error;
      }
    };

    return { submit, bookable, description, start, end, t, bookings };
  },
});
</script>
