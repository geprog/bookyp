import { DOMWrapper, shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';
import { mocked } from 'ts-jest/utils';
import { nextTick } from 'vue';

import SpaceMap from '~/components/space/SpaceMap.vue';
import { mockSvg } from '$/__helpers__/svg';

function prepareCreateSVGPointOnce(wrapper: { find: (arg0: string) => DOMWrapper<Element> }) {
  // simple mock for the SVGSVGElement received by the click event
  const position = { x: 11, y: 22 } as SVGPoint;
  const svgPoint = {
    x: 0,
    y: 0,
    matrixTransform: () => position,
  } as SVGPoint;
  const svg = mockSvg(wrapper.find('[data-test=space-map]'));
  mocked(svg.element.createSVGPoint).mockReturnValueOnce(svgPoint);
  return { svg, position };
}

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
    const { svg, position } = prepareCreateSVGPointOnce(wrapper);

    // when
    await svg.trigger('click', { clientX: 0, clientY: 0 });
    await nextTick();

    // then
    expect(wrapper.emitted('clickInsideSvg')).toBeTruthy();
    expect(wrapper.emitted('clickInsideSvg')).toHaveLength(1);
    expect(wrapper.emitted('clickInsideSvg')?.[0]).toStrictEqual([position]);
  });

  it('should emit position when moving the mouse', async () => {
    expect.assertions(3);
    // given
    const wrapper = shallowMount(SpaceMap, {});
    const { svg, position } = prepareCreateSVGPointOnce(wrapper);

    // when
    await svg.trigger('mousemove', { clientX: 0, clientY: 0 });
    await nextTick();

    // then
    expect(wrapper.emitted('moveInsideSvg')).toBeTruthy();
    expect(wrapper.emitted('moveInsideSvg')).toHaveLength(1);
    expect(wrapper.emitted('moveInsideSvg')?.[0]).toStrictEqual([position]);
  });

  it('should emit position when mouseup', async () => {
    expect.assertions(3);
    // given
    const wrapper = shallowMount(SpaceMap, {});
    const { svg, position } = prepareCreateSVGPointOnce(wrapper);

    // when
    await svg.trigger('mouseup', { clientX: 0, clientY: 0 });
    await nextTick();

    // then
    expect(wrapper.emitted('upInsideSvg')).toBeTruthy();
    expect(wrapper.emitted('upInsideSvg')).toHaveLength(1);
    expect(wrapper.emitted('upInsideSvg')?.[0]).toStrictEqual([position]);
  });

  it('should emit position when mousedown', async () => {
    expect.assertions(3);
    // given
    const wrapper = shallowMount(SpaceMap, {});
    const { svg, position } = prepareCreateSVGPointOnce(wrapper);
    // when
    await svg.trigger('mousedown', { clientX: 0, clientY: 0 });
    await nextTick();

    // then
    expect(wrapper.emitted('downInsideSvg')).toBeTruthy();
    expect(wrapper.emitted('downInsideSvg')).toHaveLength(1);
    expect(wrapper.emitted('downInsideSvg')?.[0]).toStrictEqual([position]);
  });

  it('should emit position when touchstart', async () => {
    expect.assertions(3);
    // given
    const wrapper = shallowMount(SpaceMap, {});
    const { svg, position } = prepareCreateSVGPointOnce(wrapper);

    // when
    await svg.trigger('touchstart', { touches: [{ pageX: 0, pageY: 0 }] });
    await nextTick();

    // then
    expect(wrapper.emitted('downInsideSvg')).toBeTruthy();
    expect(wrapper.emitted('downInsideSvg')).toHaveLength(1);
    expect(wrapper.emitted('downInsideSvg')?.[0]).toStrictEqual([position]);
  });

  it('should emit position when touchend', async () => {
    expect.assertions(3);
    // given
    const wrapper = shallowMount(SpaceMap, {});
    const { svg, position } = prepareCreateSVGPointOnce(wrapper);

    // when
    await svg.trigger('touchend', { touches: [{ pageX: 0, pageY: 0 }] });
    await nextTick();

    // then
    expect(wrapper.emitted('upInsideSvg')).toBeTruthy();
    expect(wrapper.emitted('upInsideSvg')).toHaveLength(1);
    expect(wrapper.emitted('upInsideSvg')?.[0]).toStrictEqual([position]);
  });

  it('should emit position when touchmove', async () => {
    expect.assertions(3);
    // given
    const wrapper = shallowMount(SpaceMap, {});
    const { svg, position } = prepareCreateSVGPointOnce(wrapper);

    // when
    await svg.trigger('touchmove', { touches: [{ pageX: 0, pageY: 0 }] });
    await nextTick();

    // then
    expect(wrapper.emitted('moveInsideSvg')).toBeTruthy();
    expect(wrapper.emitted('moveInsideSvg')).toHaveLength(1);
    expect(wrapper.emitted('moveInsideSvg')?.[0]).toStrictEqual([position]);
  });
});
