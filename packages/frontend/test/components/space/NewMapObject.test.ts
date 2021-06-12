import { shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';

import NewMapObject from '~/components/space/NewMapObject.vue';
import { sampleMapObject } from '$/__fixtures__/mapObject';

jest.mock('~/compositions/useFind');

describe('NewMapObject component', () => {
  it('should render correctly in viewing mode', () => {
    // given

    // when
    const wrapper = shallowMount(NewMapObject, {
      props: {
        newMapObject: sampleMapObject,
      },
    });

    // then
    expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
    expect(wrapper.findAll('path')).toHaveLength(2); //
    expect(wrapper.findAll('path')[0].attributes('d')).toStrictEqual(sampleMapObject.paths[0]);
    expect(wrapper.findAll('path')[1].attributes('d')).toStrictEqual(sampleMapObject.paths[1]);
  });
});
