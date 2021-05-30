import { Model } from '@bookyp/core';
import { shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';

import NewMapObject from '~/components/space/NewMapObject.vue';

jest.mock('~/compositions/useFind');

const mapObject = {
  xPos: 0,
  yPos: 0,
  rotation: 0,
  paths: ['M56.9259 1.12463H17.0648V83.4525H56.9259V1.12463Z', 'M17.0648 26.6198H1.12036V58.4886H17.0648V26.6198Z'],
  type: Model.MapObjectTypes.table,
};

describe('FloorPlan component', () => {
  it('should render correctly in viewing mode', () => {
    // given

    // when
    const wrapper = shallowMount(NewMapObject, {
      props: {
        newMapObject: mapObject,
      },
    });

    // then
    expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
    expect(wrapper.findAll('path')).toHaveLength(2); //
    expect(wrapper.findAll('path')[0].attributes('d')).toStrictEqual(mapObject.paths[0]);
    expect(wrapper.findAll('path')[1].attributes('d')).toStrictEqual(mapObject.paths[1]);
  });
});
