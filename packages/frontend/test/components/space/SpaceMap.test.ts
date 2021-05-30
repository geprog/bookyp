import { shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';
import { mocked } from 'ts-jest/utils';
import { nextTick } from 'vue';

import SpaceMap from '~/components/space/SpaceMap.vue';
import { mockSvg } from '$/helpers/svg';

describe('SpaceMap component', () => {
  it('should render correctly', () => {
    // given

    // when
    const wrapper = shallowMount(SpaceMap, {});

    // then
    expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
  });

  it('should emit position', async () => {
    expect.assertions(3);
    // given
    const wrapper = shallowMount(SpaceMap, {});
    // simple mock for the SVGSVGElement received by the click event
    const position = { x: 11, y: 22 } as SVGPoint;
    const svgPoint = {
      x: 0,
      y: 0,
      matrixTransform: () => position,
    } as SVGPoint;
    const svg = mockSvg(wrapper.find('[data-test=space-map]'));
    mocked(svg.element.createSVGPoint).mockReturnValueOnce(svgPoint);

    // when
    await svg.trigger('click', { clientX: 0, clientY: 0 });
    await nextTick();

    // then
    expect(wrapper.emitted('clickInsideSvg')).toBeTruthy();
    expect(wrapper.emitted('clickInsideSvg')).toHaveLength(1);
    expect(wrapper.emitted('clickInsideSvg')?.[0]).toStrictEqual([position]);
  });
});
