import { BoundingBox, svgPathBbox } from 'svg-path-bbox';
import { computed, inject, onBeforeUnmount, Ref } from 'vue';

import { SpaceMapKey } from '~/symbols/space-map';

export type Path =
  | string
  | {
      x: number;
      y: number;
      d: string;
    };

export type ViewBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const EMPTY_VIEW_BOX: ViewBox = { x: 0, y: 0, width: 0, height: 0 };

export function combineViewBoxes(viewBox1: ViewBox, viewBox2: ViewBox): ViewBox {
  if (viewBox1 === EMPTY_VIEW_BOX) {
    return viewBox2;
  }
  if (viewBox2 === EMPTY_VIEW_BOX) {
    return viewBox1;
  }
  const x = Math.min(viewBox1.x, viewBox2.x);
  const y = Math.min(viewBox1.y, viewBox2.y);
  const maxX = Math.max(viewBox1.x + viewBox1.width, viewBox2.x + viewBox2.width);
  const maxY = Math.max(viewBox1.y + viewBox1.height, viewBox2.y + viewBox2.height);
  return { x, y, width: maxX - x, height: maxY - y };
}

function boundingBoxToViewBox(boundingBox: BoundingBox): ViewBox {
  const [minX, minY, maxX, maxY] = boundingBox;
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

type ViewBoxOptions = { strokeWidth: number };

export default function useViewBox(paths: Ref<Path[]>, { strokeWidth }: ViewBoxOptions): Ref<ViewBox> {
  return computed(() => {
    if (paths.value.length === 0) {
      return EMPTY_VIEW_BOX;
    }
    const boundingBoxes = paths.value.map((path) => {
      let boundingBox: BoundingBox;
      if (typeof path === 'string') {
        boundingBox = svgPathBbox(path);
      } else {
        const [minX, minY, maxX, maxY] = svgPathBbox(path.d);
        boundingBox = [minX + path.x, minY + path.y, maxX + path.x, maxY + path.y];
      }
      return boundingBoxToViewBox(boundingBox);
    });
    const viewBox = boundingBoxes.reduce(combineViewBoxes, EMPTY_VIEW_BOX);
    const strokeOffset = strokeWidth / 2;
    return {
      x: viewBox.x - strokeOffset,
      y: viewBox.y - strokeOffset,
      width: viewBox.width + 2 * strokeOffset,
      height: viewBox.height + 2 * strokeOffset,
    };
  });
}

export function useAndRegisterViewBox(viewBoxKey: string, paths: Ref<Path[]>, options: ViewBoxOptions): void {
  const spaceMap = inject(SpaceMapKey);
  if (!spaceMap) {
    throw new Error(`There is no provider for ${SpaceMapKey.toString()} available`);
  }
  const viewBox = useViewBox(paths, options);
  spaceMap.registerViewBox(viewBoxKey, viewBox);
  onBeforeUnmount(() => {
    spaceMap.unregisterViewBox(viewBoxKey);
  });
}
