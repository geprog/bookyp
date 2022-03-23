import { shallowMount } from '@vue/test-utils';

import BookableForm from '~/components/bookables/BookableForm.vue';
import { sampleBookable } from '$/__fixtures__/bookable';

describe('BookableForm component', () => {
  describe('Template', () => {
    it('should render correctly', () => {
      // given

      // when
      const bookableForm = shallowMount(BookableForm, {
        props: {
          bookable: sampleBookable,
        },
        global: {
          // stub needed due to caching issue. see https://github.com/vuejs/vue-test-utils-next/issues/530
          stubs: {
            InputField: {
              template: '<div><slot /></div>',
            },
          },
        },
      });

      // then
      expect(bookableForm.html()).toMatchSnapshot();
    });

    it('should render correctly with new bookable', () => {
      // given

      // when
      const bookableForm = shallowMount(BookableForm, {
        props: {
          bookable: {},
        },
        global: {
          // stub needed due to caching issue. see https://github.com/vuejs/vue-test-utils-next/issues/530
          stubs: {
            InputField: {
              template: '<div><slot /></div>',
            },
          },
        },
      });

      // then
      expect(bookableForm.html()).toMatchSnapshot();
    });
  });

  it('should emit save', async () => {
    expect.assertions(1);

    // given
    const wrapper = shallowMount(BookableForm, {
      props: {
        bookable: sampleBookable,
      },
    });

    // when
    await wrapper.find('[data-test=form]').trigger('submit');

    // then
    const event = wrapper.emitted('save');
    expect(event).toHaveLength(1);
  });

  it('should display provided bookable info', () => {
    expect.assertions(2);

    // when
    const wrapper = shallowMount(BookableForm, {
      props: {
        bookable: sampleBookable,
      },
      global: {
        stubs: {
          InputField: {
            template: '<div><slot /></div>',
          },
          TextField: {
            template: '<input type="text" />',
          },
        },
      },
    });

    // then
    expect(wrapper.get<HTMLInputElement>('[data-test=form-name]').attributes().modelvalue).toStrictEqual(
      sampleBookable.name,
    );
    expect(wrapper.get<HTMLInputElement>('[data-test=form-description]').attributes().modelvalue).toStrictEqual(
      sampleBookable.description,
    );
  });

  it('should emit update when name changes', async () => {
    expect.assertions(2);

    // given
    const newBookableName = 'Electric Table';
    const wrapper = shallowMount(BookableForm, {
      props: {
        bookable: sampleBookable,
      },
      global: {
        stubs: {
          InputField: {
            template: '<div><slot /></div>',
          },
        },
      },
    });

    // when
    await wrapper.getComponent('[data-test=form-name]').setValue(newBookableName);
    // then
    const bookableUpdateEvents = wrapper.emitted('update:bookable');
    expect(bookableUpdateEvents).toHaveLength(1);
    expect(bookableUpdateEvents?.[0]).toStrictEqual([{ ...sampleBookable, name: newBookableName }]);
  });

  it('should emit update when description changes', async () => {
    expect.assertions(2);

    // given
    const newBookableDescription = 'It can increase and decrease its height';
    const wrapper = shallowMount(BookableForm, {
      props: {
        bookable: sampleBookable,
      },
      global: {
        stubs: {
          InputField: {
            template: '<div><slot /></div>',
          },
        },
      },
    });

    // when
    await wrapper.getComponent('[data-test=form-description]').setValue(newBookableDescription);

    // then
    const bookableUpdateEvents = wrapper.emitted('update:bookable');
    expect(bookableUpdateEvents).toHaveLength(1);
    expect(bookableUpdateEvents?.[0]).toStrictEqual([
      {
        ...sampleBookable,
        description: newBookableDescription,
      },
    ]);
  });
});
