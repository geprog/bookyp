import useFeathers from '~/compositions/useFeathers';
import useFindOriginal, { UseFind } from '~/compositions/useFind';

import { mountComposition } from '../helpers/composition';
import { eventHelper } from '../helpers/events';
import TestModel from '../helpers/TestModel';

jest.mock('~/compositions/useFeathers');

// convert type of useFind to support dummy service
const useFind = (useFindOriginal as unknown) as (key: 'testModels') => UseFind<TestModel>;

const testModel: TestModel = { _id: '111', mood: '😀', action: '🧘' };
const testModels: TestModel[] = [testModel];
const additionalTestModel: TestModel = { _id: 'aaa', mood: '🤩', action: '🏄' };
const changedTestModel: TestModel = { ...testModel, mood: '😅', action: '🏋️' };

describe('Find composition', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  it('should load data on mounted', async () => {
    expect.assertions(3);

    // given
    const serviceFind = jest.fn(() => testModels);
    const useFeathersMock = {
      service: () => ({
        find: serviceFind,
        on: jest.fn(),
        off: jest.fn(),
      }),
      on: jest.fn(),
    };
    (useFeathers as jest.Mock).mockReturnValue(useFeathersMock);

    // when
    let findComposition = null as UseFind<TestModel> | null;
    await mountComposition(() => {
      findComposition = useFind('testModels');
    });

    // then
    expect(serviceFind).toHaveBeenCalledTimes(1);
    expect(findComposition).toBeTruthy();
    expect(findComposition && findComposition.data.value).toStrictEqual(testModels);
  });

  it('should load data after connect', async () => {
    expect.assertions(3);

    // given
    const serviceFind = jest.fn(() => testModels);
    const emitter = eventHelper();
    const useFeathersMock = {
      service: () => ({
        find: serviceFind,
        on: jest.fn(),
        off: jest.fn(),
      }),
      on: emitter.on,
    };
    (useFeathers as jest.Mock).mockReturnValue(useFeathersMock);
    let findComposition = null as UseFind<TestModel> | null;
    const wrapper = await mountComposition(() => {
      findComposition = useFind('testModels');
    });
    serviceFind.mockClear(); // continue with fresh mock

    // when
    emitter.emit('connect');
    await wrapper.vm.$nextTick();

    // then
    expect(serviceFind).toHaveBeenCalledTimes(1);
    expect(findComposition).toBeTruthy();
    expect(findComposition && findComposition.data.value).toStrictEqual(testModels);
  });

  it('should indicate data loading', async () => {
    expect.assertions(2);

    // given
    const useFeathersMock = {
      service: () => ({
        find: jest.fn(() => new Promise(() => null)),
        on: jest.fn(),
        off: jest.fn(),
      }),
      on: jest.fn(),
    };
    (useFeathers as jest.Mock).mockReturnValue(useFeathersMock);
    let findComposition = null as UseFind<TestModel> | null;
    const wrapper = await mountComposition(() => {
      findComposition = useFind('testModels');
    });

    // when
    await wrapper.vm.$nextTick();

    // then
    expect(findComposition).toBeTruthy();
    expect(findComposition && findComposition.isLoading.value).toBeTruthy();
  });

  it('should indicate data finished loading', async () => {
    expect.assertions(2);

    // given
    let serviceFindPromiseResolve: (value: TestModel[] | PromiseLike<TestModel[]>) => void = jest.fn();
    const serviceFind = jest.fn(() => {
      return new Promise<TestModel[]>((resolve) => {
        serviceFindPromiseResolve = resolve;
      });
    });
    const useFeathersMock = {
      service: () => ({
        find: serviceFind,
        on: jest.fn(),
        off: jest.fn(),
      }),
      on: jest.fn(),
    };
    (useFeathers as jest.Mock).mockReturnValue(useFeathersMock);
    let findComposition = null as UseFind<TestModel> | null;
    const wrapper = await mountComposition(() => {
      findComposition = useFind('testModels');
    });

    // when
    serviceFindPromiseResolve(testModels);
    await wrapper.vm.$nextTick();

    // then
    expect(findComposition).toBeTruthy();
    expect(findComposition && findComposition.isLoading.value).toBeFalsy();
  });

  describe('Event Handlers', () => {
    it('should listen to "create" events', async () => {
      expect.assertions(2);

      // given
      const emitter = eventHelper();
      const useFeathersMock = {
        service: () => ({
          find: jest.fn(() => []),
          on: emitter.on,
          off: jest.fn(),
        }),
        on: jest.fn(),
      };
      (useFeathers as jest.Mock).mockReturnValue(useFeathersMock);
      let findComposition = null as UseFind<TestModel> | null;
      const wrapper = await mountComposition(() => {
        findComposition = useFind('testModels');
      });

      // when
      emitter.emit('created', additionalTestModel);
      await wrapper.vm.$nextTick();

      // then
      expect(findComposition).toBeTruthy();
      expect(findComposition && findComposition.data.value).toContainEqual(additionalTestModel);
    });

    it('should listen to "patch" events', async () => {
      expect.assertions(2);

      // given
      const emitter = eventHelper();
      const useFeathersMock = {
        service: () => ({
          find: jest.fn(() => testModels),
          on: emitter.on,
          off: jest.fn(),
        }),
        on: jest.fn(),
      };
      (useFeathers as jest.Mock).mockReturnValue(useFeathersMock);
      let findComposition = null as UseFind<TestModel> | null;
      const wrapper = await mountComposition(() => {
        findComposition = useFind('testModels');
      });

      // when
      emitter.emit('patched', changedTestModel);
      await wrapper.vm.$nextTick();

      // then
      expect(findComposition).toBeTruthy();
      expect(findComposition && findComposition.data.value).toContainEqual(changedTestModel);
    });

    it('should listen to "update" events', async () => {
      expect.assertions(2);

      // given
      const emitter = eventHelper();
      const useFeathersMock = {
        service: () => ({
          find: jest.fn(() => testModels),
          on: emitter.on,
          off: jest.fn(),
        }),
        on: jest.fn(),
      };
      (useFeathers as jest.Mock).mockReturnValue(useFeathersMock);
      let findComposition = null as UseFind<TestModel> | null;
      const wrapper = await mountComposition(() => {
        findComposition = useFind('testModels');
      });

      // when
      emitter.emit('updated', changedTestModel);
      await wrapper.vm.$nextTick();

      // then
      expect(findComposition).toBeTruthy();
      expect(findComposition && findComposition.data.value).toContainEqual(changedTestModel);
    });

    it('should listen to "remove" events', async () => {
      expect.assertions(2);

      // given
      const emitter = eventHelper();
      const useFeathersMock = {
        service: () => ({
          find: jest.fn(() => testModels),
          on: emitter.on,
          off: jest.fn(),
        }),
        on: jest.fn(),
      };
      (useFeathers as jest.Mock).mockReturnValue(useFeathersMock);
      let findComposition = null as UseFind<TestModel> | null;
      const wrapper = await mountComposition(() => {
        findComposition = useFind('testModels');
      });

      // when
      emitter.emit('removed', testModel);
      await wrapper.vm.$nextTick();

      // then
      expect(findComposition).toBeTruthy();
      expect(findComposition && findComposition.data.value).not.toContainEqual(testModel);
    });

    it('should unmount the event handlers', async () => {
      expect.assertions(6);

      // given
      const serviceOff = jest.fn();
      const useFeathersMock = {
        service: () => ({
          find: jest.fn(),
          on: jest.fn(),
          off: serviceOff,
        }),
        on: jest.fn(),
      };
      (useFeathers as jest.Mock).mockReturnValue(useFeathersMock);
      let findComposition = null as UseFind<TestModel> | null;
      const wrapper = await mountComposition(() => {
        findComposition = useFind('testModels');
      });

      // when
      wrapper.unmount();
      await wrapper.vm.$nextTick();

      // then
      expect(findComposition).toBeTruthy();
      expect(serviceOff).toHaveBeenCalledTimes(4);
      expect(serviceOff).toHaveBeenCalledWith('created', expect.anything());
      expect(serviceOff).toHaveBeenCalledWith('updated', expect.anything());
      expect(serviceOff).toHaveBeenCalledWith('patched', expect.anything());
      expect(serviceOff).toHaveBeenCalledWith('removed', expect.anything());
    });
  });
});
