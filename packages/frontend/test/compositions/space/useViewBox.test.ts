import { shallowMount } from '@vue/test-utils';
import { h, provide, ref } from 'vue';

import useViewBox, {
  combineViewBoxes,
  EMPTY_VIEW_BOX,
  useAndRegisterViewBox,
  ViewBox,
} from '~/compositions/space/useViewBox';
import { SpaceMapKey } from '~/symbols/space-map';

describe('useViewBox composition', () => {
  it('should calculate correctly for one single path', () => {
    // given
    const minX = 10;
    const minY = 10;
    const width = 10;
    const height = 10;
    const paths = ref([`M${minX} ${minY} l${width} ${height}`]);
    const strokeWidth = 1;
    // when
    const viewBox = useViewBox(paths, { strokeWidth });
    // then
    expect(viewBox.value).toStrictEqual({
      x: minX - 4 * strokeWidth,
      y: minY - 4 * strokeWidth,
      width: width + 8 * strokeWidth,
      height: height + 8 * strokeWidth,
    });
  });

  it('should calculate empty viewBox for empty paths', () => {
    // given
    const paths = ref([]);
    // when
    const viewBox = useViewBox(paths, { strokeWidth: 1 });
    // then
    expect(viewBox.value).toStrictEqual({ x: 0, y: 0, width: 0, height: 0 });
  });

  it('should calculate correctly for many paths', () => {
    // given
    const minX = 10;
    const minY = 10;
    const width = 20;
    const height = 20;
    const paths = ref([
      `M${minX} ${minY} l${width} ${height}`,
      `M${minX * 2} ${minY * 2} l${width} ${height}`,
      `M${minX * -2} ${minY * -2} l${width} ${height}`,
    ]);
    const strokeWidth = 1;
    // when
    const viewBox = useViewBox(paths, { strokeWidth });
    // then
    expect(viewBox.value).toStrictEqual({
      x: minX * -2 - 4 * strokeWidth,
      y: minY * -2 - 4 * strokeWidth,
      width: width * 3 + 8 * strokeWidth,
      height: height * 3 + 8 * strokeWidth,
    });
  });

  it('should be reactive on the paths array', () => {
    // given
    const minX = 10;
    const minY = 10;
    const width = 10;
    const height = 10;
    const paths = ref([`M${minX} ${minY} l${width} ${height}`]);
    const strokeWidth = 1;
    const viewBox = useViewBox(paths, { strokeWidth });
    // when
    paths.value = [`M${minX * 2} ${minY * 2} l${width * 2} ${height * 2}`];
    // then
    expect(viewBox.value).toStrictEqual({
      x: minX * 2 - 4 * strokeWidth,
      y: minY * 2 - 4 * strokeWidth,
      width: width * 2 + 8 * strokeWidth,
      height: height * 2 + 8 * strokeWidth,
    });
  });

  it('should calculate correctly for paths with offset', () => {
    // given
    const x = 50;
    const y = 50;
    const minX = 10;
    const minY = 10;
    const width = 10;
    const height = 10;
    const paths = ref([
      {
        x,
        y,
        d: `M${minX} ${minY} l${width} ${height}`,
      },
    ]);
    const strokeWidth = 1;
    // when
    const viewBox = useViewBox(paths, { strokeWidth });
    // then
    expect(viewBox.value).toStrictEqual({
      x: minX + x - 4 * strokeWidth,
      y: minY + y - 4 * strokeWidth,
      width: width + 8 * strokeWidth,
      height: height + 8 * strokeWidth,
    });
  });

  describe('exported function combineViewBoxes', () => {
    it('should handle EMPTY_VIEW_BOX properly as first argument', () => {
      // given
      const viewBox: ViewBox = { x: 10, y: 10, width: 10, height: 10 };
      // when
      const combinedViewBox = combineViewBoxes(EMPTY_VIEW_BOX, viewBox);
      // then
      expect(combinedViewBox).toBe(viewBox);
    });

    it('should handle EMPTY_VIEW_BOX properly as second argument', () => {
      // given
      const viewBox: ViewBox = { x: 10, y: 10, width: 10, height: 10 };
      // when
      const combinedViewBox = combineViewBoxes(viewBox, EMPTY_VIEW_BOX);
      // then
      expect(combinedViewBox).toBe(viewBox);
    });

    it('should create view box containing both of the given view boxes', () => {
      // given
      const viewBox1: ViewBox = { x: 10, y: 10, width: 10, height: 10 };
      const viewBox2: ViewBox = { x: 50, y: 50, width: 10, height: 10 };
      // when
      const combinedViewBox = combineViewBoxes(viewBox1, viewBox2);
      // then
      expect(combinedViewBox).toStrictEqual({ x: 10, y: 10, width: 50, height: 50 });
    });
  });

  describe('exported function useAndRegisterViewBox', () => {
    it('should calc view box and register it for SpaceMap', () => {
      // given
      const spaceMapMock = {
        registerViewBox: jest.fn(),
        unregisterViewBox: jest.fn(),
        on: jest.fn(),
      };
      const paths = ref([]);
      const viewBoxKey = 'Test';

      const component = {
        template: '<slot></slot>',
        setup() {
          provide(SpaceMapKey, spaceMapMock);
        },
      };
      const childComponent = {
        template: '<p>Horst</p>',
        setup() {
          useAndRegisterViewBox(viewBoxKey, paths, { strokeWidth: 1 });
        },
      };
      // when
      shallowMount(component, {
        slots: {
          default: h(childComponent),
        },
      });
      // then
      expect(spaceMapMock.registerViewBox).toHaveBeenCalledWith(
        viewBoxKey,
        expect.objectContaining({ value: { x: 0, y: 0, width: 0, height: 0 } }),
      );
    });

    it('should unregister view box onBeforeUnmount', () => {
      // given
      const spaceMapMock = {
        registerViewBox: jest.fn(),
        unregisterViewBox: jest.fn(),
        on: jest.fn(),
      };
      const paths = ref([]);
      const viewBoxKey = 'Test';

      const component = {
        template: '<slot></slot>',
        setup() {
          provide(SpaceMapKey, spaceMapMock);
        },
      };
      const childComponent = {
        template: '<p>Horst</p>',
        setup() {
          useAndRegisterViewBox(viewBoxKey, paths, { strokeWidth: 1 });
        },
      };
      const wrapper = shallowMount(component, {
        slots: {
          default: h(childComponent),
        },
      });
      // when
      wrapper.unmount();
      // then
      expect(spaceMapMock.unregisterViewBox).toHaveBeenCalledWith(viewBoxKey);
    });

    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('should throw error when no provider for SpaceMap', () => {
      // TODO: Test disabled because vue/inject generates a warning if no provider found which lets the test fail
      // given
      const paths = ref([]);
      const viewBoxKey = 'Test';

      const component = {
        template: '<p>Horst</p>',
        setup() {
          useAndRegisterViewBox(viewBoxKey, paths, { strokeWidth: 1 });
        },
      };
      // when
      shallowMount(component);
      // then
      expect(useAndRegisterViewBox).toThrow(`There is no provider for ${SpaceMapKey.toString()} available`);
    });
  });
});
