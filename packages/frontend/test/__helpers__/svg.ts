import { DOMWrapper } from '@vue/test-utils';

type SVG = {
  createSVGPoint: () => SVGPoint;
  getScreenCTM: () => DOMMatrix | null;
};

type SVGElement<T extends Element> = DOMWrapper<T> & { element: T & SVG };

export function mockSvg<T extends Element>(wrapper: DOMWrapper<T>): SVGElement<T> {
  const mockedSVG = {
    createSVGPoint: vi.fn(),
    getScreenCTM: vi.fn(),
    setPointerCapture: vi.fn(),
    releasePointerCapture: vi.fn(),
  };
  mockedSVG.getScreenCTM.mockReturnValue({ inverse: vi.fn() } as unknown as DOMMatrix);
  Object.assign(wrapper.element, mockedSVG);
  return wrapper as SVGElement<T>;
}
