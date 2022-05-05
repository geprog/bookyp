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

  describe('Provide event emitter', () => {
    function prepareProvideEventEmitter(eventName: SpaceMapEvents) {
      const eventCallback = jest.fn();
      const childComponent = {
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

    it('should emit position when pointermove', async () => {
      expect.assertions(2);
      // given
      const { eventCallback, wrapper } = prepareProvideEventEmitter('moveInsideSvg');
      const { svg, position } = prepareCreateSVGPointOnce(wrapper);
      const event = { clientX: 0, clientY: 0 };

      // when
      await svg.trigger('pointermove', event);

      // then
      expect(eventCallback).toHaveBeenCalledTimes(1);
      expect(eventCallback).toHaveBeenCalledWith(position, expect.objectContaining(event));
    });

    it('should emit position when pointerup', async () => {
      expect.assertions(2);
      // given
      const { eventCallback, wrapper } = prepareProvideEventEmitter('upInsideSvg');
      const { svg, position } = prepareCreateSVGPointOnce(wrapper);
      const event = { clientX: 0, clientY: 0 };

      // when
      await svg.trigger('pointerup', event);

      // then
      expect(eventCallback).toHaveBeenCalledTimes(1);
      expect(eventCallback).toHaveBeenCalledWith(position, expect.objectContaining(event));
    });

    it('should emit position when pointerdown', async () => {
      expect.assertions(2);
      // given
      const { eventCallback, wrapper } = prepareProvideEventEmitter('downInsideSvg');
      const { svg, position } = prepareCreateSVGPointOnce(wrapper);
      const event = { clientX: 0, clientY: 0 };

      // when
      await svg.trigger('pointerdown', event);

      // then
      expect(eventCallback).toHaveBeenCalledTimes(1);
      expect(eventCallback).toHaveBeenCalledWith(position, expect.objectContaining(event));
    });
  });

  describe('ViewBox handling', () => {
    it('should resize the SVG view-box based on view-boxes injected by child components', async () => {
      expect.assertions(1);
      // given
      const viewBox: ViewBox = { x: 10, y: 20, width: 50, height: 100 };
      const childComponent = {
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
      expect(wrapper.find('[data-test=space-map]').attributes('viewBox')).toBe(
        `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`,
      );
    });

    it('should update view-box when a child component updates its view box', async () => {
      expect.assertions(1);
      // given
      const viewBox: ViewBox = { x: 10, y: 20, width: 50, height: 100 };
      const viewBoxRef = ref(viewBox);
      const childComponent = {
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
      expect(wrapper.find('[data-test=space-map]').attributes('viewBox')).toBe(
        `${currentViewBox.x} ${currentViewBox.y} ${currentViewBox.width} ${currentViewBox.height}`,
      );
    });
  });
});
