import { shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';

import TextField from '~/components/TextField.vue';

describe('TextField component', () => {
  it('should render correctly', () => {
    // given
    const modelValue = 'my-value';
    const placeholder = 'my-placeholder';

    // when
    const wrapper = shallowMount(TextField, {
      props: {
        modelValue,
        placeholder,
      },
    });

    // then
    expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
  });

  describe('Internal input field', () => {
    it('should render HTML input element', () => {
      // when
      const wrapper = shallowMount(TextField);

      // then
      expect(wrapper.find('input[type=text]').exists()).toBeTruthy();
    });

    it('should contain an initial value', () => {
      // given
      const initialValue = 'Hello world!';

      // when
      const wrapper = shallowMount(TextField, {
        props: {
          modelValue: initialValue,
        },
      });

      // then
      expect(wrapper.get<HTMLInputElement>('input[type=text]').element.value).toBe(initialValue);
    });

    it('should emit changes as update:modelValue', async () => {
      // given
      const wrapper = shallowMount(TextField);
      const inputElement = wrapper.get<HTMLInputElement>('input[type=text]');
      const newValue = 'test-value';

      // when
      await inputElement.setValue(newValue);

      // then
      const emittedValues = wrapper.emitted()['update:modelValue'];
      expect(emittedValues.length).toBe(1);
      expect(emittedValues[0]).toEqual([newValue]);
    });
  });

  describe('Input placeholder', () => {
    it('should not have a placeholder', () => {
      // when
      const wrapper = shallowMount(TextField);

      // then
      expect(wrapper.find<HTMLInputElement>('input[type=text]').element.placeholder).toBeFalsy();
    });

    it('should have a placeholder', () => {
      // given
      const placeholderData = 'test placeholder';

      // when
      const wrapper = shallowMount(TextField, {
        props: {
          placeholder: placeholderData,
        },
      });

      // then
      expect(wrapper.get<HTMLInputElement>('input[type=text]').element.placeholder).toBe(placeholderData);
    });
  });
});
