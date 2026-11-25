import type { Ref } from 'vue';
import type { MapObject } from '#shared/types/models';
import type { ViewBox } from '~/utils/spaceMap';
import { svgPathBbox } from 'svg-path-bbox';
import svgpath from 'svgpath';
import { spaceMapKey } from '~/utils/spaceMap';

export type Path
  = | string
    | {
      x: number;
      y: number;
      d: string;
      rotation: number;
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

function boundingBoxToViewBox([minX, minY, maxX, maxY]: [number, number, number, number]): ViewBox {
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function safeBbox(d: string): [number, number, number, number] {
  try {
    return svgPathBbox(d) as [number, number, number, number];
  }
  catch {
    return [0, 0, 0, 0];
  }
}

interface ViewBoxOptions { strokeWidth: number }

/** the bounding box of the given paths (map objects are rotated around their center first) */
export function useViewBox(paths: Ref<Path[]>, { strokeWidth }: ViewBoxOptions): Ref<ViewBox> {
  return computed(() => {
    if (paths.value.length === 0) {
      return EMPTY_VIEW_BOX;
    }
    const boxes = paths.value.map((path) => {
      if (typeof path === 'string') {
        return boundingBoxToViewBox(safeBbox(path));
      }
      const { x, y, width, height } = boundingBoxToViewBox(safeBbox(path.d));
      const bboxPath = `M${x} ${y} h${width} v${height} h${-width} Z`;
      const origin = { x: x + width * 0.5, y: y + height * 0.5 };
      const rotated = svgpath(bboxPath)
        .translate(-origin.x, -origin.y)
        .rotate(path.rotation)
        .translate(origin.x, origin.y)
        .toString();
      const [minX, minY, maxX, maxY] = safeBbox(rotated);
      return boundingBoxToViewBox([minX + path.x, minY + path.y, maxX + path.x, maxY + path.y]);
    });
    const viewBox = boxes.reduce(combineViewBoxes, EMPTY_VIEW_BOX);
    return {
      x: viewBox.x - 4 * strokeWidth,
      y: viewBox.y - 4 * strokeWidth,
      width: viewBox.width + 8 * strokeWidth,
      height: viewBox.height + 8 * strokeWidth,
    };
  });
}

export function mapObjectsToPaths(mapObjects: Ref<Pick<MapObject, 'xPos' | 'yPos' | 'paths' | 'rotation'>[]>): Ref<Path[]> {
  return computed(() =>
    mapObjects.value.map(mapObject => ({
      x: mapObject.xPos,
      y: mapObject.yPos,
      d: mapObject.paths.join(' '),
      rotation: mapObject.rotation,
    })),
  );
}

/** registers the bounding box of a layer at the surrounding SpaceMap, so the map shows all layers */
export function useAndRegisterViewBox(key: string, paths: Ref<Path[]>, options: ViewBoxOptions): void {
  const spaceMap = inject(spaceMapKey);
  if (!spaceMap) {
    throw new Error('There is no SpaceMap around this component');
  }
  const viewBox = useViewBox(paths, options);
  spaceMap.registerViewBox(key, viewBox);
  onBeforeUnmount(() => spaceMap.unregisterViewBox(key));
}
