import { DOMWrapper, shallowMount } from '@vue/test-utils';
import { mocked } from 'ts-jest/utils';
import { h, inject, nextTick, ref } from 'vue';

import SpaceMap from '~/components/space/SpaceMap.vue';
import { ViewBox } from '~/compositions/space/useViewBox';
import { SpaceMapEvents, SpaceMapKey } from '~/symbols/space-map';
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
    const wrapper = shallowMount(SpaceMap);

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should emit position', async () => {
    expect.assertions(3);
    // given
    const wrapper = shallowMount(SpaceMap);
    const { svg, position } = prepareCreateSVGPointOnce(wrapper);

    // when
    await svg.trigger('click', { clientX: 0, clientY: 0 });

    // then
    expect(wrapper.emitted('clickInsideSvg')).toBeTruthy();
    expect(wrapper.emitted('clickInsideSvg')).toHaveLength(1);
    expect(wrapper.emitted('clickInsideSvg')?.[0]).toStrictEqual([position]);
  });

  it('should emit position when moving the mouse', async () => {
    expect.assertions(3);
    // given
    const wrapper = shallowMount(SpaceMap);
    const { svg, position } = prepareCreateSVGPointOnce(wrapper);

    // when
    await svg.trigger('mousemove', { clientX: 0, clientY: 0 });

    // then
    expect(wrapper.emitted('moveInsideSvg')).toBeTruthy();
    expect(wrapper.emitted('moveInsideSvg')).toHaveLength(1);
    expect(wrapper.emitted('moveInsideSvg')?.[0]).toStrictEqual([position]);
  });

  it('should emit position when mouseup', async () => {
    expect.assertions(2);
    // given
    const wrapper = shallowMount(SpaceMap);
    const { svg } = prepareCreateSVGPointOnce(wrapper);

    // when
    await svg.trigger('mouseup', { clientX: 0, clientY: 0 });

    // then
    expect(wrapper.emitted('upInsideSvg')).toBeTruthy();
    expect(wrapper.emitted('upInsideSvg')).toHaveLength(1);
  });

  it('should emit position when mousedown', async () => {
    expect.assertions(3);
    // given
    const wrapper = shallowMount(SpaceMap);
    const { svg, position } = prepareCreateSVGPointOnce(wrapper);
    // when
    await svg.trigger('mousedown', { clientX: 0, clientY: 0 });

    // then
    expect(wrapper.emitted('downInsideSvg')).toBeTruthy();
    expect(wrapper.emitted('downInsideSvg')).toHaveLength(1);
    expect(wrapper.emitted('downInsideSvg')?.[0]).toStrictEqual([position]);
  });

  it('should emit position when touchstart', async () => {
    expect.assertions(3);
    // given
    const wrapper = shallowMount(SpaceMap);
    const { svg, position } = prepareCreateSVGPointOnce(wrapper);

    // when
    await svg.trigger('touchstart', { touches: [{ clientX: 0, clientY: 0 }] });

    // then
    expect(wrapper.emitted('downInsideSvg')).toBeTruthy();
    expect(wrapper.emitted('downInsideSvg')).toHaveLength(1);
    expect(wrapper.emitted('downInsideSvg')?.[0]).toStrictEqual([position]);
  });

  it('should emit position when touchmove', async () => {
    expect.assertions(3);
    // given
    const wrapper = shallowMount(SpaceMap);
    const { svg, position } = prepareCreateSVGPointOnce(wrapper);

    // when
    await svg.trigger('touchmove', { touches: [{ clientX: 0, clientY: 0 }] });

    // then
    expect(wrapper.emitted('moveInsideSvg')).toBeTruthy();
    expect(wrapper.emitted('moveInsideSvg')).toHaveLength(1);
    expect(wrapper.emitted('moveInsideSvg')?.[0]).toStrictEqual([position]);
  });

  it('should emit event when touchend', async () => {
    expect.assertions(2);
    // given
    const wrapper = shallowMount(SpaceMap);
    const { svg } = prepareCreateSVGPointOnce(wrapper);

    // when
    await svg.trigger('touchend');

    // then
    expect(wrapper.emitted('upInsideSvg')).toBeTruthy();
    expect(wrapper.emitted('upInsideSvg')).toHaveLength(1);
  });

  describe('Provide event emitter', () => {
    function prepareProvideEventEmitter(eventName: SpaceMapEvents) {
      const eventCallback = jest.fn();
      const childComponent = {
        // eslint-disable-next-line @intlify/vue-i18n/no-raw-text
        template: '<p>Horst</p>',

        setup() {
          const spaceMap = inject(SpaceMapKey);
          spaceMap?.on(eventName, eventCallback);
        },
      };

      const wrapper = shallowMount(SpaceMap, {
        slots: {
          default: h(childComponent),
        },
      });
      return { wrapper, eventCallback };
    }

    it('provides an EventEmitter', () => {
      expect.assertions(1);

      // given
      const childComponent = {
        // eslint-disable-next-line @intlify/vue-i18n/no-raw-text
        template: '<p>Horst</p>',

        setup() {
          const spaceMap = inject(SpaceMapKey);

          // then
          expect(spaceMap).toHaveProperty('on');
        },
      };

      // when
      shallowMount(SpaceMap, {
        slots: {
          default: h(childComponent),
        },
      });
    });

    it('should emit position when clicking', async () => {
      expect.assertions(2);
      // given
      const { eventCallback, wrapper } = prepareProvideEventEmitter('clickInsideSvg');
      const { svg, position } = prepareCreateSVGPointOnce(wrapper);

      // when
      await svg.trigger('click', { clientX: 0, clientY: 0 });

      // then
      expect(eventCallback).toHaveBeenCalledTimes(1);
      expect(eventCallback).toHaveBeenCalledWith(position);
    });

    it('should emit position when moving the mouse', async () => {
      expect.assertions(2);
      // given
      const { eventCallback, wrapper } = prepareProvideEventEmitter('moveInsideSvg');
      const { svg, position } = prepareCreateSVGPointOnce(wrapper);

      // when
      await svg.trigger('mousemove', { clientX: 0, clientY: 0 });

      // then
      expect(eventCallback).toHaveBeenCalledTimes(1);
      expect(eventCallback).toHaveBeenCalledWith(position);
    });

    it('should emit position when mouseup', async () => {
      expect.assertions(1);
      // given
      const { eventCallback, wrapper } = prepareProvideEventEmitter('upInsideSvg');
      const { svg } = prepareCreateSVGPointOnce(wrapper);

      // when
      await svg.trigger('mouseup', { clientX: 0, clientY: 0 });

      // then
      expect(eventCallback).toHaveBeenCalledTimes(1);
    });

    it('should emit position when mousedown', async () => {
      expect.assertions(2);
      // given
      const { eventCallback, wrapper } = prepareProvideEventEmitter('downInsideSvg');
      const { svg, position } = prepareCreateSVGPointOnce(wrapper);

      // when
      await svg.trigger('mousedown', { clientX: 0, clientY: 0 });

      // then
      expect(eventCallback).toHaveBeenCalledTimes(1);
      expect(eventCallback).toHaveBeenCalledWith(position);
    });

    it('should emit position when touchstart', async () => {
      expect.assertions(2);
      // given
      const { eventCallback, wrapper } = prepareProvideEventEmitter('downInsideSvg');
      const { svg, position } = prepareCreateSVGPointOnce(wrapper);

      // when
      await svg.trigger('touchstart', { touches: [{ clientX: 0, clientY: 0 }] });

      // then
      expect(eventCallback).toHaveBeenCalledTimes(1);
      expect(eventCallback).toHaveBeenCalledWith(position);
    });

    it('should emit position when touchmove', async () => {
      expect.assertions(2);
      // given
      const { eventCallback, wrapper } = prepareProvideEventEmitter('moveInsideSvg');
      const { svg, position } = prepareCreateSVGPointOnce(wrapper);

      // when
      await svg.trigger('touchmove', { touches: [{ clientX: 0, clientY: 0 }] });

      // then
      expect(eventCallback).toHaveBeenCalledTimes(1);
      expect(eventCallback).toHaveBeenCalledWith(position);
    });

    it('should emit event when touchend', async () => {
      expect.assertions(1);
      // given
      const { eventCallback, wrapper } = prepareProvideEventEmitter('upInsideSvg');
      const { svg } = prepareCreateSVGPointOnce(wrapper);

      // when
      await svg.trigger('touchend');
      // then
      expect(eventCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('ViewBox handling', () => {
    it('should resize the SVG view-box based on view-boxes injected by child components', async () => {
      expect.assertions(1);
      // given
      const viewBox: ViewBox = { x: 10, y: 20, width: 50, height: 100 };
      const childComponent = {
        // eslint-disable-next-line @intlify/vue-i18n/no-raw-text
        template: '<p>Horst</p>',

        setup() {
          const spaceMap = inject(SpaceMapKey);
          spaceMap?.registerViewBox('ViewBoxTestComponent', ref(viewBox));
        },
      };

      // when
      const wrapper = shallowMount(SpaceMap, {
        slots: {
          default: h(childComponent),
        },
      });
      await nextTick();

      // then
      expect(wrapper.find('[data-test=space-map]').attributes('viewBox')).toStrictEqual(
        `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`,
      );
    });

    it('should update view-box when a child component updates its view box', async () => {
      expect.assertions(1);
      // given
      const viewBox: ViewBox = { x: 10, y: 20, width: 50, height: 100 };
      const viewBoxRef = ref(viewBox);
      const childComponent = {
        // eslint-disable-next-line @intlify/vue-i18n/no-raw-text
        template: '<p>Horst</p>',

        setup() {
          const spaceMap = inject(SpaceMapKey);
          spaceMap?.registerViewBox('ViewBoxTestComponent', viewBoxRef);
        },
      };
      const wrapper = shallowMount(SpaceMap, {
        slots: {
          default: h(childComponent),
        },
      });
      await nextTick();

      // when
      viewBoxRef.value.x = 100;
      await nextTick();

      // then
      const currentViewBox = viewBoxRef.value;
      expect(wrapper.find('[data-test=space-map]').attributes('viewBox')).toStrictEqual(
        `${currentViewBox.x} ${currentViewBox.y} ${currentViewBox.width} ${currentViewBox.height}`,
      );
    });
  });
});
