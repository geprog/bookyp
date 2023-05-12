const tileServer = 'https://tiles.geprog.com';

const config = {
  map: {
    brightMapStyle: `${tileServer}/styles/bright-matter/style.json`,
    darkMapStyle: `${tileServer}/styles/gray-matter/style.json`,
    minZoom: 5,
    maxZoom: 18,
    center: [10.1283, 54.3166] as [number, number], // currently Kiel
    zoom: 10,
    // [west, south, east, north] (currently borders of Germany)
    maxBounds: [5.0, 46.0, 15.0, 57.0] as [number, number, number, number],
  },
  email: 'hello@bookyp.de',
};

export function getConfig(): typeof config {
  return config;
}
