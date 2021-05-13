/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Model } from '@bookyp/core';
import { mount, shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';
import { mocked } from 'ts-jest/utils';
import { ref } from 'vue';

import useFeathers, { ClientApplication } from '~/compositions/useFeathers';
import useFind from '~/compositions/useFind';
import Space from '~/views/settings/Space.vue';
import { mockSvg } from '$/helpers/svg';

jest.mock('~/compositions/useFeathers');
jest.mock('~/compositions/useFind');
jest.mock('vue-i18n');

describe('Space component', () => {
  it('should render correctly', () => {
    // given
    const useFeathersMock = ({
      service: () => ({
        find: jest.fn(() => []),
        create: jest.fn(),
      }),
    } as unknown) as ClientApplication;
    mocked(useFeathers, true).mockReturnValue(useFeathersMock);

    const useFindMock = {
      data: ref([]),
      isLoading: ref(false),
    };
    mocked(useFind).mockReturnValue(useFindMock);

    // when
    const wrapper = shallowMount(Space, {});

    // then
    expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
  });

  it('should display a floorPlan', async () => {
    expect.assertions(2);
    // given
    const useFeathersMock = ({
      service: () => ({
        find: jest.fn(() => []),
        create: jest.fn(),
      }),
    } as unknown) as ClientApplication;
    mocked(useFeathers).mockReturnValue(useFeathersMock);

    const floorPlan = [
      'M288 325H30.2315V226.738H1V1H288V325Z',
      'M1 1.96375V44.2787H43.5143C43.4181 20.8928 24.4229 1.96428 1 1.96375Z',
    ];
    const useFindMock = {
      data: ref([
        {
          _id: 'dummy-id',
          floorPlan,
        },
      ]),
      isLoading: ref(false),
    };
    mocked(useFind).mockReturnValue(useFindMock);

    // when
    const wrapper = shallowMount(Space, {});
    await wrapper.vm.$nextTick();

    // then
    expect(wrapper.findAll('path')[0].attributes('d')).toStrictEqual(floorPlan[0]);
    expect(wrapper.findAll('path')[1].attributes('d')).toStrictEqual(floorPlan[1]);
  });
  it('should display a floorPlan and mapObjects', async () => {
    expect.assertions(3);
    // given
    const useFeathersMock = ({
      service: () => ({
        find: jest.fn(() => []),
        create: jest.fn(),
      }),
    } as unknown) as ClientApplication;
    mocked(useFeathers).mockReturnValue(useFeathersMock);

    const floorPlan = [
      'M288 325H30.2315V226.738H1V1H288V325Z',
      'M1 1.96375V44.2787H43.5143C43.4181 20.8928 24.4229 1.96428 1 1.96375Z',
    ];

    const mapObjects = [
      {
        _id: '1',
        xPos: 0,
        yPos: 0,
        rotation: 0,
        paths: [
          'M56.9259 1.12463H17.0648V83.4525H56.9259V1.12463Z',
          'M17.0648 26.6198H1.12036V58.4886H17.0648V26.6198Z',
        ],
        type: Model.MapObjectTypes.table,
      },
      {
        _id: '2',
        xPos: 50,
        yPos: 100,
        rotation: 0,
        paths: [
          'M56.9259 1.12463H17.0648V83.4525H56.9259V1.12463Z',
          'M17.0648 26.6198H1.12036V58.4886H17.0648V26.6198Z',
        ],
        type: Model.MapObjectTypes.table,
      },
    ];

    const mapObjectsMock = {
      data: ref(mapObjects),
      isLoading: ref(false),
    };

    const spaceMock = {
      data: ref([
        {
          _id: 'dummy-id',
          floorPlan,
        },
      ]),
      isLoading: ref(false),
    };

    mocked(useFind).mockReturnValueOnce(spaceMock).mockReturnValueOnce(mapObjectsMock);

    // when
    const wrapper = shallowMount(Space, {});
    await wrapper.vm.$nextTick();

    // then
    expect(wrapper.findAll('path')).toHaveLength(6);
    expect(wrapper.findAll('path')[2].attributes('d')).toStrictEqual(mapObjects[0].paths[0]);
    expect(wrapper.findAll('path')[3].attributes('d')).toStrictEqual(mapObjects[0].paths[1]);
  });

  it('should trigger addMapObjectFunction if clicking the add button', () => {
    // given
    const useFeathersMock = ({
      service: () => ({
        find: jest.fn(() => []),
        create: jest.fn(),
      }),
    } as unknown) as ClientApplication;
    mocked(useFeathers).mockReturnValue(useFeathersMock);

    const useFindMock = {
      data: ref([]),
      isLoading: ref(false),
    };
    mocked(useFind).mockReturnValue(useFindMock);
    const mockRoute = {
      push: jest.fn(),
    };
    const mockRouter = {
      push: jest.fn(),
    };

    // when
    const wrapper = mount(Space, {
      global: {
        mocks: {
          $route: mockRoute,
          $router: mockRouter,
        },
      },
    });
    void wrapper.find('[data-test=add-button]').trigger('click');

    // then
    expect(wrapper.vm.editing).toBe(true);
    expect(wrapper.vm.newMapObject).not.toBe(false);
  });

  it('should not render save button', () => {
    expect.assertions(1);
    // given
    const useFeathersMock = ({
      service: () => ({
        find: jest.fn(() => []),
        create: jest.fn(),
      }),
    } as unknown) as ClientApplication;
    mocked(useFeathers).mockReturnValue(useFeathersMock);

    const useFindMock = {
      data: ref([]),
      isLoading: ref(false),
    };
    mocked(useFind).mockReturnValue(useFindMock);

    // when
    const wrapper = shallowMount(Space, {});

    // then
    expect(wrapper.find('[data-test=save-button]').exists()).toBe(false);
  });

  it('should render save button when user clicked on add-table-button', async () => {
    expect.assertions(1);
    // given
    const useFeathersMock = ({
      service: () => ({
        find: jest.fn(() => []),
        create: jest.fn(),
      }),
    } as unknown) as ClientApplication;
    mocked(useFeathers).mockReturnValue(useFeathersMock);

    const useFindMock = {
      data: ref([]),
      isLoading: ref(false),
    };
    mocked(useFind).mockReturnValue(useFindMock);

    const mockRoute = {
      push: jest.fn(),
    };
    const mockRouter = {
      push: jest.fn(),
    };

    // when
    const wrapper = mount(Space, {
      global: {
        mocks: {
          $route: mockRoute,
          $router: mockRouter,
        },
      },
    });
    await wrapper.find('[data-test=add-button]').trigger('click');
    await wrapper.vm.$nextTick();

    // then
    expect(wrapper.find('[data-test=save-button]').exists()).toBe(true);
  });

  it('should save newMapObject when clicking save', async () => {
    expect.assertions(2);
    // given
    const useFeathersServiceMock = {
      find: jest.fn(() => []),
      create: jest.fn(),
    };
    const useFeathersMock = ({
      service: () => useFeathersServiceMock,
    } as unknown) as ClientApplication;
    mocked(useFeathers).mockReturnValue(useFeathersMock);

    const useFindMock = {
      data: ref([]),
      isLoading: ref(false),
    };
    mocked(useFind).mockReturnValue(useFindMock);

    const mockRoute = {
      push: jest.fn(),
    };
    const mockRouter = {
      push: jest.fn(),
    };

    const wrapper = mount(Space, {
      global: {
        mocks: {
          $route: mockRoute,
          $router: mockRouter,
        },
      },
    });
    await wrapper.find('[data-test=add-button]').trigger('click');
    await wrapper.vm.$nextTick();

    // when
    await wrapper.find('[data-test=save-button]').trigger('click');
    await wrapper.vm.$nextTick();

    // then
    expect(wrapper.find('[data-test=save-button]').exists()).toBe(false);
    expect(useFeathersServiceMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        paths: expect.any(Array),
        rotation: expect.any(Number),
        type: expect.any(String),
        xPos: expect.any(Number),
        yPos: expect.any(Number),
      }),
    );
  });

  it('should not render delete button', () => {
    expect.assertions(1);
    // given
    const useFeathersMock = ({
      service: () => ({
        find: jest.fn(() => []),
        create: jest.fn(),
      }),
    } as unknown) as ClientApplication;
    mocked(useFeathers).mockReturnValue(useFeathersMock);

    const floorPlan = [
      'M288 325H30.2315V226.738H1V1H288V325Z',
      'M1 1.96375V44.2787H43.5143C43.4181 20.8928 24.4229 1.96428 1 1.96375Z',
    ];
    const useFindMock = {
      data: ref([
        {
          _id: 'dummy-id',
          floorPlan,
        },
      ]),
      isLoading: ref(false),
    };
    mocked(useFind).mockReturnValue(useFindMock);
    const mockRoute = {
      push: jest.fn(),
    };
    const mockRouter = {
      push: jest.fn(),
    };

    // when
    const wrapper = mount(Space, {
      global: {
        mocks: {
          $route: mockRoute,
          $router: mockRouter,
        },
      },
    });
    // then
    expect(wrapper.find('[data-test=delete-button]').exists()).toBe(false);
  });

  it('should render delete button when user clicked on a mapObject', async () => {
    expect.assertions(1);
    // given
    const useFeathersMock = ({
      service: () => ({
        find: jest.fn(() => []),
        create: jest.fn(),
      }),
    } as unknown) as ClientApplication;
    mocked(useFeathers).mockReturnValue(useFeathersMock);
    const mockRoute = {
      push: jest.fn(),
    };
    const mockRouter = {
      push: jest.fn(),
    };
    const floorPlan = [
      'M288 325H30.2315V226.738H1V1H288V325Z',
      'M1 1.96375V44.2787H43.5143C43.4181 20.8928 24.4229 1.96428 1 1.96375Z',
    ];

    const mapObjects = [
      {
        _id: '1',
        xPos: 0,
        yPos: 0,
        rotation: 0,
        paths: [
          'M56.9259 1.12463H17.0648V83.4525H56.9259V1.12463Z',
          'M17.0648 26.6198H1.12036V58.4886H17.0648V26.6198Z',
        ],
        type: Model.MapObjectTypes.table,
      },
      {
        _id: '2',
        xPos: 50,
        yPos: 100,
        rotation: 0,
        paths: [
          'M56.9259 1.12463H17.0648V83.4525H56.9259V1.12463Z',
          'M17.0648 26.6198H1.12036V58.4886H17.0648V26.6198Z',
        ],
        type: Model.MapObjectTypes.table,
      },
    ];

    const mapObjectsMock = {
      data: ref(mapObjects),
      isLoading: ref(false),
    };

    const spaceMock = {
      data: ref([
        {
          _id: 'dummy-id',
          floorPlan,
        },
      ]),
      isLoading: ref(false),
    };

    mocked(useFind).mockReturnValueOnce(spaceMock).mockReturnValueOnce(mapObjectsMock);
    const wrapper = mount(Space, {
      global: {
        mocks: {
          $route: mockRoute,
          $router: mockRouter,
        },
      },
    });
    // when
    await wrapper.findAll('path')[2].trigger('click');
    await wrapper.vm.$nextTick();
    // then
    expect(wrapper.find('[data-test=delete-button]').exists()).toBe(true);
  });

  it('should move newMapObject to clicked position when in edit mode', async () => {
    expect.assertions(3);
    // given
    const useFeathersServiceMock = {
      find: jest.fn(() => []),
      create: jest.fn(),
    };
    const useFeathersMock = ({
      service: () => useFeathersServiceMock,
    } as unknown) as ClientApplication;
    mocked(useFeathers).mockReturnValue(useFeathersMock);

    const useFindMock = {
      data: ref([]),
      isLoading: ref(false),
    };
    mocked(useFind).mockReturnValue(useFindMock);

    const mockRoute = {
      push: jest.fn(),
    };
    const mockRouter = {
      push: jest.fn(),
    };

    const wrapper = mount(Space, {
      global: {
        mocks: {
          $route: mockRoute,
          $router: mockRouter,
        },
      },
    });

    await wrapper.find('[data-test=add-button]').trigger('click');
    await wrapper.vm.$nextTick();

    // simple mock for the SVGSVGElement received by the click event
    const position = { x: 11, y: 22 } as SVGPoint;
    const svgPoint = {
      x: 0,
      y: 0,
      matrixTransform: () => position,
    } as SVGPoint;
    const svg = mockSvg(wrapper.find('[data-test=space-map]'));
    mocked(svg.element.createSVGPoint).mockReturnValueOnce(svgPoint);

    // when
    await svg.trigger('click', { clientX: 0, clientY: 0 });
    await wrapper.vm.$nextTick();

    // then
    const newMapObjectHtml = wrapper.find('[data-test=new-map-object]').html();
    const regexResult = /translate\((.*?),(.*?)\)/.exec(newMapObjectHtml);
    if (!regexResult) {
      throw new Error("Can't find the position of the new mapObject");
    }

    const [, posX, posY] = regexResult;

    expect(regexResult).toHaveLength(3); // 1 total match with 2 groups
    expect(parseInt(posX)).toBe(position.x);
    expect(parseInt(posY)).toBe(position.y);
  });

  it('should ignore map click and positioning event when not in edit mode', async () => {
    expect.assertions(1);
    const useFindMock = {
      data: ref([]),
      isLoading: ref(false),
    };
    mocked(useFind).mockReturnValue(useFindMock);

    // given
    const useFeathersMock = ({
      service: () => ({
        find: jest.fn(() => []),
        create: jest.fn(),
      }),
    } as unknown) as ClientApplication;
    mocked(useFeathers).mockReturnValue(useFeathersMock);
    // simple mock for the SVGSVGElement received by the click event
    const mockedSVG = {
      createSVGPoint: jest.fn(),
    };

    const mockRoute = {
      push: jest.fn(),
    };
    const mockRouter = {
      push: jest.fn(),
    };

    const wrapper = mount(Space, {
      global: {
        mocks: {
          $route: mockRoute,
          $router: mockRouter,
        },
      },
    });

    // when
    await wrapper.find('[data-test=space-map]').trigger('click', { clientX: 0, clientY: 0, mockedSVG });
    await wrapper.vm.$nextTick();

    // then
    expect(mockedSVG.createSVGPoint).not.toHaveBeenCalled();
  });

  it('should delete selectedMapObject when clicking on delete', async () => {
    expect.assertions(2);

    // given
    const useFindMock = {
      data: ref([]),
      isLoading: ref(false),
    };
    mocked(useFind).mockReturnValue(useFindMock);

    const useFeathersServiceMock = {
      find: jest.fn(() => []),
      create: jest.fn(),
      remove: jest.fn(),
    };

    const useFeathersMock = ({
      service: () => useFeathersServiceMock,
    } as unknown) as ClientApplication;
    mocked(useFeathers).mockReturnValue(useFeathersMock);

    const mockRoute = {
      push: jest.fn(),
    };
    const mockRouter = {
      push: jest.fn(),
    };

    const floorPlan = [
      'M288 325H30.2315V226.738H1V1H288V325Z',
      'M1 1.96375V44.2787H43.5143C43.4181 20.8928 24.4229 1.96428 1 1.96375Z',
    ];

    const mapObjects = [
      {
        _id: '1',
        xPos: 0,
        yPos: 0,
        rotation: 0,
        paths: [
          'M56.9259 1.12463H17.0648V83.4525H56.9259V1.12463Z',
          'M17.0648 26.6198H1.12036V58.4886H17.0648V26.6198Z',
        ],
        type: Model.MapObjectTypes.table,
      },
      {
        _id: '2',
        xPos: 50,
        yPos: 100,
        rotation: 0,
        paths: [
          'M56.9259 1.12463H17.0648V83.4525H56.9259V1.12463Z',
          'M17.0648 26.6198H1.12036V58.4886H17.0648V26.6198Z',
        ],
        type: Model.MapObjectTypes.table,
      },
    ];

    const mapObjectsMock = {
      data: ref(mapObjects),
      isLoading: ref(false),
    };

    const spaceMock = {
      data: ref([
        {
          _id: 'dummy-id',
          floorPlan,
        },
      ]),
      isLoading: ref(false),
    };

    mocked(useFind).mockReturnValueOnce(spaceMock).mockReturnValueOnce(mapObjectsMock);
    const wrapper = mount(Space, {
      global: {
        mocks: {
          $route: mockRoute,
          $router: mockRouter,
        },
      },
    });
    await wrapper.findAll('path')[2].trigger('click');
    await wrapper.vm.$nextTick();
    // when
    await wrapper.find('[data-test=delete-button]').trigger('click');
    await wrapper.vm.$nextTick();
    // then
    expect(wrapper.find('[data-test=delete-button]').exists()).toBe(false);
    expect(useFeathersServiceMock.remove).toHaveBeenCalledWith('1');
  });
});
