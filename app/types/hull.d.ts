declare module 'hull.js' {
  function hull(points: [number, number][], concavity?: number, format?: string[]): [number, number][];
  export default hull;
}
