import { Model } from '@bookyp/core';
import { BoundingBox, svgPathBbox } from 'svg-path-bbox';
import svgpath from 'svgpath';
import { computed, inject, onBeforeUnmount, Ref } from 'vue';

import { SpaceMapKey } from '~/symbols/space-map';

export type Path =
  | string
  | {
      x: number;
      y: number;
      d: string;
      rotation: number;
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
        // we need to apply the rotation to the path so that we know the proper view box
        // we do this by simply rotating the non-rotated bounding box around its own center
        const { x, y, width, height } = boundingBoxToViewBox(svgPathBbox(path.d));
        const bboxPath = `M${x} ${y} h${width} v${height} h${-width} Z`;
        const origin = {
          x: x + width * 0.5,
          y: y + height * 0.5,
        };
        const rotatedPath = svgpath(bboxPath)
          .translate(-origin.x, -origin.y)
          .rotate(path.rotation)
          .translate(origin.x, origin.y)
          .toString();
        const [minX, minY, maxX, maxY] = svgPathBbox(rotatedPath);
        boundingBox = [minX + path.x, minY + path.y, maxX + path.x, maxY + path.y];
      }
      return boundingBoxToViewBox(boundingBox);
    });
    const viewBox = boundingBoxes.reduce(combineViewBoxes, EMPTY_VIEW_BOX);
    return {
      x: viewBox.x - 4 * strokeWidth,
      y: viewBox.y - 4 * strokeWidth,
      width: viewBox.width + 8 * strokeWidth,
      height: viewBox.height + 8 * strokeWidth,
    };
  });
}

export function mapObjectsToPaths(
  mapObjects: Ref<Pick<Model.MapObject, 'xPos' | 'yPos' | 'paths' | 'rotation'>[]>,
): Ref<Path[]> {
  return computed(() =>
    mapObjects.value.reduce<Path[]>((allPaths, mapObject) => {
      const aggregatedPath: Path = {
        x: mapObject.xPos,
        y: mapObject.yPos,
        d: mapObject.paths.join(' '),
        rotation: mapObject.rotation,
      };
      return [...allPaths, aggregatedPath];
    }, []),
  );
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
