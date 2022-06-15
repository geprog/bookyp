import { DOMWrapper } from '@vue/test-utils';

type SVG = {
  createSVGPoint: () => SVGPoint;
  getScreenCTM: () => DOMMatrix | null;
};

type SVGElement<T extends Element> = DOMWrapper<T> & { element: T & SVG };

export function mockSvg<T extends Element>(wrapper: DOMWrapper<T>): SVGElement<T> {
  const mockedSVG = {
    createSVGPoint: jest.fn(),
    getScreenCTM: jest.fn(),
    setPointerCapture: jest.fn(),
    releasePointerCapture: jest.fn(),
  };
  mockedSVG.getScreenCTM.mockReturnValue({ inverse: jest.fn() } as unknown as DOMMatrix);
  Object.assign(wrapper.element, mockedSVG);
  return wrapper as SVGElement<T>;
}
