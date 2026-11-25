import hull from 'hull.js';

/**
 * Calculates a background shape (concave hull) around the given svg paths. The background
 * is filled to color map objects, while the paths themselves are only stroked.
 * Needs a DOM (uses `getPointAtLength`), so it only runs in the browser.
 */
export function getBgPathsFromPaths(paths: string[]): string[] {
  const points = paths.reduce<[number, number][]>((acc, path) => {
    const element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    element.setAttribute('d', path);
    const length = element.getTotalLength();
    for (let i = 0; i < length; i += 1) {
      const point = element.getPointAtLength(i);
      acc.push([point.x, point.y]);
    }
    return acc;
  }, []);

  if (points.length === 0) {
    return [];
  }

  const outline = hull(points, 8) as [number, number][];
  const d = outline.map(([x, y], index) => `${index ? 'L' : 'M'}${x},${y}`).join('');
  return [d];
}

/** extracts the `d` attributes of all paths (and the view box) of an svg file */
export function parseSvgFile(content: string): { paths: string[]; viewBox: string | null } {
  const doc = new DOMParser().parseFromString(content, 'image/svg+xml');
  const paths = Array.from(doc.getElementsByTagName('path'))
    .map(path => path.getAttribute('d'))
    .filter((d): d is string => d !== null);
  const viewBox = doc.getElementsByTagName('svg')[0]?.getAttribute('viewBox') ?? null;
  return { paths, viewBox };
}
