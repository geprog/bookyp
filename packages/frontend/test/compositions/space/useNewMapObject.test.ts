import { mocked } from 'ts-jest/utils';

import useNewMapObject from '~/compositions/space/useNewMapObject';
import useFeathers, { ClientApplication } from '~/compositions/useFeathers';
import { newMapObject as newMapObjectFixture } from '$/__fixtures__/mapObject';

jest.mock('~/compositions/useFeathers');

describe('useNewMapObject composition', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  it('should add a map-object', () => {
    // given
    const { addMapObject, newMapObject } = useNewMapObject();

    // when
    addMapObject();

    // then
    expect(newMapObject.value).toMatchSnapshot();
  });

  it('should save a new map-object', async () => {
    expect.assertions(2);
    // given
    const createFunction = jest.fn();
    mocked(useFeathers).mockImplementationOnce(
      () =>
        (({
          service: () => ({
            create: createFunction,
          }),
        } as unknown) as ClientApplication),
    );
    const { saveNewMapObject, newMapObject } = useNewMapObject();
    newMapObject.value = newMapObjectFixture;

    // when
    await saveNewMapObject();

    // then
    expect(createFunction).toHaveBeenCalledTimes(1);
    expect(createFunction).toHaveBeenCalledWith(newMapObjectFixture);
  });

  it('should not save a map-object when it is not set', async () => {
    expect.assertions(1);
    // given
    const createFunction = jest.fn();
    mocked(useFeathers).mockImplementationOnce(
      () =>
        (({
          service: () => ({
            create: createFunction,
          }),
        } as unknown) as ClientApplication),
    );
    const { saveNewMapObject } = useNewMapObject();

    // when
    await saveNewMapObject();

    // then
    expect(createFunction).toHaveBeenCalledTimes(0);
  });

  it('should position a map-object', () => {
    // given
    const { positionNewMapObject, newMapObject } = useNewMapObject();
    newMapObject.value = newMapObjectFixture;
    const svgPoint = { x: 123, y: 456 };

    // when
    positionNewMapObject(svgPoint);

    // then
    expect(newMapObject.value.xPos).toBe(svgPoint.x);
    expect(newMapObject.value.yPos).toBe(svgPoint.y);
  });

  it('should not position a map-object when it is not set', () => {
    // given
    const { positionNewMapObject, newMapObject } = useNewMapObject();
    const svgPoint = { x: 123, y: 456 };

    // when
    positionNewMapObject(svgPoint);

    // then
    expect(newMapObject.value).toBeNull();
  });
});
