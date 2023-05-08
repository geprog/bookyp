import { DOMWrapper, mount, shallowMount } from '@vue/test-utils';
import { inject, nextTick, ref } from 'vue';

import { ViewBox } from '~/compositions/space/useViewBox';
import { SpaceEventTypes, SpaceMapKey, SpaceObjectTypes } from '~/symbols/space-map';
import { mockSvg } from '$/__helpers__/svg';

import SpaceMap from './SpaceMap.vue';

function prepareCreateSVGPoint(wrapper: { find: (arg0: string) => DOMWrapper<Element> }, count = 1) {
  // simple mock for the SVGSVGElement received by the click event
  const position = { x: 11, y: 22 } as SVGPoint;
  const svgPoint = {
    x: 0,
    y: 0,
    matrixTransform: () => position,
  } as SVGPoint;
  const svg = mockSvg(wrapper.find('[data-test=space-map]'));
  let svgMock = vi.mocked(svg.element.createSVGPoint);
  while (count > 0) {
    svgMock = svgMock.mockReturnValueOnce(svgPoint);
    count--;
  }
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
    function prepareProvideEventEmitter(eventType: SpaceEventTypes, objectType: SpaceObjectTypes) {
      const eventCallback = vi.fn();
      const childComponent = {
        template: '<p>Horst</p>',

        setup() {
          const spaceMap = inject(SpaceMapKey);
          spaceMap?.on(eventType, objectType, eventCallback);
        },
      };

      const wrapper = mount(SpaceMap, {
        slots: {
          default: childComponent,
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
      mount(SpaceMap, {
        slots: {
          default: childComponent,
        },
      });
    });

    it('should emit position when pointermove', async () => {
      expect.assertions(2);
      // given
      const { eventCallback, wrapper } = prepareProvideEventEmitter('move', 'root');
      const { svg, position } = prepareCreateSVGPoint(wrapper, 2);
      const event = { screenX: 2, screenY: 2, clientX: 2, clientY: 2 };

      // when
      await svg.trigger('pointermove', event);

      // then
      expect(eventCallback).toHaveBeenCalledTimes(1);
      expect(eventCallback).toHaveBeenCalledWith(null, position);
    });

    it('should emit position when pointerup', async () => {
      expect.assertions(2);
      // given
      const { eventCallback, wrapper } = prepareProvideEventEmitter('up', 'root');
      const { svg, position } = prepareCreateSVGPoint(wrapper);
      const event = { clientX: 0, clientY: 0 };

      // when
      await svg.trigger('pointerup', event);

      // then
      expect(eventCallback).toHaveBeenCalledTimes(1);
      expect(eventCallback).toHaveBeenCalledWith(null, position);
    });

    it('should emit position when pointerdown', async () => {
      expect.assertions(2);
      // given
      const { eventCallback, wrapper } = prepareProvideEventEmitter('down', 'root');
      const { svg, position } = prepareCreateSVGPoint(wrapper);
      const event = { clientX: 0, clientY: 0 };

      // when
      await svg.trigger('pointerdown', event);

      // then
      expect(eventCallback).toHaveBeenCalledTimes(1);
      expect(eventCallback).toHaveBeenCalledWith(null, position);
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
      const wrapper = mount(SpaceMap, {
        slots: {
          default: childComponent,
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
      const wrapper = mount(SpaceMap, {
        slots: {
          default: childComponent,
        },
      });
      await nextTick();

      // when
      viewBoxRef.value = { ...viewBoxRef.value, x: 100 };
      await nextTick();

      // then
      const currentViewBox = viewBoxRef.value;
      expect(wrapper.find('[data-test=space-map]').attributes('viewBox')).toBe(
        `${currentViewBox.x} ${currentViewBox.y} ${currentViewBox.width} ${currentViewBox.height}`,
      );
    });
  });
});
