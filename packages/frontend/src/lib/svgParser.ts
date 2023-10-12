import hull from 'hull.js';

export function getBgPathsFromPaths(paths: string[]): string[] {
  const points = paths.reduce((acc, path) => {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', path);

    const pathLength = p.getTotalLength();
    const step = 1;
    for (let i = 0; i < pathLength; i += step) {
      const point = p.getPointAtLength(i);
      acc.push([point.x, point.y]);
    }

    return acc;
  }, [] as [number, number][]);

  const p = hull(points, 8);

  let path = '';
  for (let i = 0, len = p.length; i < len; i++) {
    path += ((i && 'L') || 'M') + `${p[i][0]},${p[i][1]}`;
  }

  return [path];
}
