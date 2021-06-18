import { shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';

import SaveAbort from '~/components/space/SaveAbort.vue';

describe('SaveAbort component', () => {
  it('should render correctly', () => {
    expect.hasAssertions();
    // given
    // when
    const wrapper = shallowMount(SaveAbort, {});
    // then
    expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
  });
  it('should emit save when click on save button', async () => {
    expect.hasAssertions();
    // given
    const wrapper = shallowMount(SaveAbort, {});
    // when
    await wrapper.find('[data-test="save-button"]').trigger('click');
    // then
    expect(wrapper.emitted('save')).toHaveLength(1);
  });
  it('should emit abort when click on abort button', async () => {
    expect.hasAssertions();
    // given
    const wrapper = shallowMount(SaveAbort, {});
    // when
    await wrapper.find('[data-test="abort-button"]').trigger('click');
    // then
    expect(wrapper.emitted('abort')).toHaveLength(1);
  });
});
