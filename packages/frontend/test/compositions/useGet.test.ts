import { Id } from '@feathersjs/feathers';
import { mocked } from 'ts-jest/utils';
import { Ref, ref } from 'vue';

import useFeathers, { ClientApplication, getId } from '~/compositions/useFeathers';
import useGetOriginal, { UseGet } from '~/compositions/useGet';
import { mountComposition } from '$/helpers/composition';
import { eventHelper } from '$/helpers/events';
import TestModel from '$/helpers/TestModel';

jest.mock('~/compositions/useFeathers');

// convert type of useGet to support dummy service
const useGet = (useGetOriginal as unknown) as (key: 'testModels', _id: Ref<Id>) => UseGet<TestModel>;

const testModel: TestModel = { _id: '111', mood: '😀', action: '🧘' };
const additionalTestModel: TestModel = { _id: 'aaa', mood: '🤩', action: '🏄' };
const changedTestModel: TestModel = { ...testModel, mood: '😅', action: '🏋️' };

describe('Get composition', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  it('should load data on mounted', async () => {
    expect.assertions(3);

    // given
    const serviceGet = jest.fn(() => testModel);
    const useFeathersMock = ({
      service: () => ({
        get: serviceGet,
        on: jest.fn(),
        off: jest.fn(),
      }),
      on: jest.fn(),
      off: jest.fn(),
    } as unknown) as ClientApplication;
    mocked(useFeathers).mockReturnValue(useFeathersMock);

    // when
    let getComposition = null as UseGet<TestModel> | null;
    await mountComposition(() => {
      getComposition = useGet('testModels', ref(testModel._id));
    });

    // then
    expect(serviceGet).toHaveBeenCalledTimes(1);
    expect(getComposition).toBeTruthy();
    expect(getComposition && getComposition.data.value).toStrictEqual(testModel);
  });

  it('should load data after connect', async () => {
    expect.assertions(3);

    // given
    const serviceGet = jest.fn(() => testModel);
    const emitter = eventHelper();
    const useFeathersMock = ({
      service: () => ({
        get: serviceGet,
        on: jest.fn(),
        off: jest.fn(),
      }),
      on: emitter.on,
      off: jest.fn(),
    } as unknown) as ClientApplication;
    mocked(useFeathers).mockReturnValue(useFeathersMock);
    let getComposition = null as UseGet<TestModel> | null;
    const wrapper = await mountComposition(() => {
      getComposition = useGet('testModels', ref(testModel._id));
    });
    serviceGet.mockClear(); // continue with fresh mock

    // when
    emitter.emit('connect');
    await wrapper.vm.$nextTick();

    // then
    expect(serviceGet).toHaveBeenCalledTimes(1);
    expect(getComposition).toBeTruthy();
    expect(getComposition && getComposition.data.value).toStrictEqual(testModel);
  });

  it('should indicate data loading', async () => {
    expect.assertions(2);

    // given
    const useFeathersMock = ({
      service: () => ({
        get: jest.fn(() => new Promise(() => null)),
        on: jest.fn(),
        off: jest.fn(),
      }),
      on: jest.fn(),
      off: jest.fn(),
    } as unknown) as ClientApplication;
    mocked(useFeathers).mockReturnValue(useFeathersMock);
    let getComposition = null as UseGet<TestModel> | null;
    const wrapper = await mountComposition(() => {
      getComposition = useGet('testModels', ref(testModel._id));
    });

    // when
    await wrapper.vm.$nextTick();

    // then
    expect(getComposition).toBeTruthy();
    expect(getComposition && getComposition.isLoading.value).toBeTruthy();
  });

  it('should indicate data finished loading', async () => {
    expect.assertions(2);

    // given
    let serviceGetPromiseResolve: (value: TestModel | PromiseLike<TestModel>) => void = jest.fn();
    const serviceGet = jest.fn(() => {
      return new Promise<TestModel>((resolve) => {
        serviceGetPromiseResolve = resolve;
      });
    });
    const useFeathersMock = ({
      service: () => ({
        get: serviceGet,
        on: jest.fn(),
        off: jest.fn(),
      }),
      on: jest.fn(),
      off: jest.fn(),
    } as unknown) as ClientApplication;
    mocked(useFeathers).mockReturnValue(useFeathersMock);
    let getComposition = null as UseGet<TestModel> | null;
    const wrapper = await mountComposition(() => {
      getComposition = useGet('testModels', ref(testModel._id));
    });

    // when
    serviceGetPromiseResolve(testModel);
    await wrapper.vm.$nextTick();

    // then
    expect(getComposition).toBeTruthy();
    expect(getComposition && getComposition.isLoading.value).toBeFalsy();
  });

  it('should reload data after changing the id', async () => {
    expect.assertions(4);

    // given
    const testModelId = ref(testModel._id);
    const serviceGet = jest.fn((id) => {
      if (id === testModel._id) {
        return testModel;
      }
      return additionalTestModel;
    });
    const useFeathersMock = ({
      service: () => ({
        get: serviceGet,
        on: jest.fn(),
        off: jest.fn(),
      }),
      on: jest.fn(),
      off: jest.fn(),
    } as unknown) as ClientApplication;
    mocked(useFeathers).mockReturnValue(useFeathersMock);
    let getComposition = null as UseGet<TestModel> | null;
    const wrapper = await mountComposition(() => {
      getComposition = useGet('testModels', testModelId);
    });

    // before then
    expect(getComposition && getComposition.data.value).toStrictEqual(testModel);

    // when
    testModelId.value = additionalTestModel._id;
    await wrapper.vm.$nextTick();

    // then
    expect(serviceGet).toHaveBeenCalledTimes(2);
    expect(getComposition).toBeTruthy();
    expect(getComposition && getComposition.data.value).toStrictEqual(additionalTestModel);
  });

  describe('Event Handlers', () => {
    it('should listen to "create" events', async () => {
      expect.assertions(2);

      // given
      const emitter = eventHelper();
      const useFeathersMock = ({
        service: () => ({
          get: jest.fn(),
          on: emitter.on,
          off: jest.fn(),
        }),
        on: jest.fn(),
        off: jest.fn(),
      } as unknown) as ClientApplication;
      mocked(useFeathers).mockReturnValue(useFeathersMock);
      let getComposition = null as UseGet<TestModel> | null;
      const wrapper = await mountComposition(() => {
        getComposition = useGet('testModels', ref(additionalTestModel._id));
      });
      mocked(getId).mockReturnValue(additionalTestModel._id);

      // when
      emitter.emit('created', additionalTestModel);
      await wrapper.vm.$nextTick();

      // then
      expect(getComposition).toBeTruthy();
      expect(getComposition && getComposition.data.value).toStrictEqual(additionalTestModel);
    });

    it('should listen to "patch" events', async () => {
      expect.assertions(2);

      // given
      const emitter = eventHelper();
      const useFeathersMock = ({
        service: () => ({
          get: jest.fn(),
          on: emitter.on,
          off: jest.fn(),
        }),
        on: jest.fn(),
        off: jest.fn(),
      } as unknown) as ClientApplication;
      mocked(useFeathers).mockReturnValue(useFeathersMock);
      let getComposition = null as UseGet<TestModel> | null;
      const wrapper = await mountComposition(() => {
        getComposition = useGet('testModels', ref(testModel._id));
      });
      mocked(getId).mockReturnValue(testModel._id);

      // when
      emitter.emit('patched', changedTestModel);
      await wrapper.vm.$nextTick();

      // then
      expect(getComposition).toBeTruthy();
      expect(getComposition && getComposition.data.value).toStrictEqual(changedTestModel);
    });

    it('should listen to "update" events', async () => {
      expect.assertions(2);

      // given
      const emitter = eventHelper();
      const useFeathersMock = ({
        service: () => ({
          get: jest.fn(),
          on: emitter.on,
          off: jest.fn(),
        }),
        on: jest.fn(),
        off: jest.fn(),
      } as unknown) as ClientApplication;
      mocked(useFeathers).mockReturnValue(useFeathersMock);
      let getComposition = null as UseGet<TestModel> | null;
      const wrapper = await mountComposition(() => {
        getComposition = useGet('testModels', ref(testModel._id));
      });
      mocked(getId).mockReturnValue(testModel._id);

      // when
      emitter.emit('updated', changedTestModel);
      await wrapper.vm.$nextTick();

      // then
      expect(getComposition).toBeTruthy();
      expect(getComposition && getComposition.data.value).toStrictEqual(changedTestModel);
    });

    it('should listen to "remove" events', async () => {
      expect.assertions(2);

      // given
      const emitter = eventHelper();
      const useFeathersMock = ({
        service: () => ({
          get: jest.fn(),
          on: emitter.on,
          off: jest.fn(),
        }),
        on: jest.fn(),
        off: jest.fn(),
      } as unknown) as ClientApplication;
      mocked(useFeathers).mockReturnValue(useFeathersMock);
      let getComposition = null as UseGet<TestModel> | null;
      const wrapper = await mountComposition(() => {
        getComposition = useGet('testModels', ref(testModel._id));
      });

      // when
      emitter.emit('removed', testModel);
      await wrapper.vm.$nextTick();

      // then
      expect(getComposition).toBeTruthy();
      expect(getComposition && getComposition.data.value).toBeUndefined();
    });

    it('should unmount the event handlers', async () => {
      expect.assertions(7);

      // given
      const serviceOff = jest.fn();
      const feathersOff = jest.fn();
      const useFeathersMock = ({
        service: () => ({
          get: jest.fn(),
          on: jest.fn(),
          off: serviceOff,
        }),
        on: jest.fn(),
        off: feathersOff,
      } as unknown) as ClientApplication;
      mocked(useFeathers).mockReturnValue(useFeathersMock);
      let getComposition = null as UseGet<TestModel> | null;
      const wrapper = await mountComposition(() => {
        getComposition = useGet('testModels', ref(testModel._id));
      });

      // when
      wrapper.unmount();
      await wrapper.vm.$nextTick();

      // then
      expect(getComposition).toBeTruthy();
      expect(feathersOff).toHaveBeenCalledTimes(1);
      expect(serviceOff).toHaveBeenCalledTimes(4);
      expect(serviceOff).toHaveBeenCalledWith('created', expect.anything());
      expect(serviceOff).toHaveBeenCalledWith('updated', expect.anything());
      expect(serviceOff).toHaveBeenCalledWith('patched', expect.anything());
      expect(serviceOff).toHaveBeenCalledWith('removed', expect.anything());
    });
  });
});
