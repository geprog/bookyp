/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { mount, shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';
import { ref } from 'vue';

import useFeathers from '~/compositions/useFeathers';
import useFind from '~/compositions/useFind';
import Space from '~/views/settings/Space.vue';

jest.mock('~/compositions/useFeathers');
jest.mock('~/compositions/useFind');
jest.mock('vue-i18n');

describe('Space component', () => {
  it('should render correctly', () => {
    // given
    // mock useFeathers
    const useFeathersMock = {
      service: () => ({
        find: jest.fn(() => []),
        create: jest.fn(),
      }),
    };
    (useFeathers as jest.Mock).mockReturnValue(useFeathersMock);

    // mock useFind
    const useFindMock = {
      data: ref([]),
    };
    (useFind as jest.Mock).mockReturnValue(useFindMock);
    // when
    const wrapper = shallowMount(Space, {});

    // then
    expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
  });
  it('should display a floorPlan', async () => {
    expect.assertions(2);
    // given
    // mock useFeathers
    const useFeathersMock = {
      service: () => ({
        find: jest.fn(() => []),
        create: jest.fn(),
      }),
    };
    (useFeathers as jest.Mock).mockReturnValue(useFeathersMock);

    // mock useFind
    const floorPlan = [
      'M288 325H30.2315V226.738H1V1H288V325Z',
      'M1 1.96375V44.2787H43.5143C43.4181 20.8928 24.4229 1.96428 1 1.96375Z',
    ];
    const useFindMock = {
      data: ref([
        {
          floorPlan,
        },
      ]),
    };
    (useFind as jest.Mock).mockReturnValue(useFindMock);

    // when
    const wrapper = shallowMount(Space, {});
    await wrapper.vm.$nextTick();

    // then
    expect(wrapper.findAll('path')[0].attributes('d')).toStrictEqual(floorPlan[0]);
    expect(wrapper.findAll('path')[1].attributes('d')).toStrictEqual(floorPlan[1]);
  });
  it('should trigger addMapObjectFunction if clicking the add button', () => {
    // given
    // mock useFeathers
    const useFeathersMock = {
      service: () => ({
        find: jest.fn(() => []),
        create: jest.fn(),
      }),
    };
    (useFeathers as jest.Mock).mockReturnValue(useFeathersMock);
    // mock useFind
    const useFindMock = {
      data: ref([]),
    };
    (useFind as jest.Mock).mockReturnValue(useFindMock);
    // when
    const wrapper = shallowMount(Space, {});
    void wrapper.find('[data-test=add-button]').trigger('click');
    // then
    expect(wrapper.vm.editing).toBe(true);
    expect(wrapper.vm.newMapObject).not.toBe(false);
  });
  it('should not render save button', () => {
    expect.assertions(1);
    // given
    // mock useFeathers
    const useFeathersMock = {
      service: () => ({
        find: jest.fn(() => []),
        create: jest.fn(),
      }),
    };
    (useFeathers as jest.Mock).mockReturnValue(useFeathersMock);
    // mock useFind
    const useFindMock = {
      data: ref([]),
    };
    (useFind as jest.Mock).mockReturnValue(useFindMock);
    // when
    const wrapper = shallowMount(Space, {});
    // then
    expect(wrapper.find('[data-test=save-button]').exists()).toBe(false);
  });
  it('should render save button when user clicked on add-table-button', async () => {
    expect.assertions(1);
    // given
    // mock useFeathers
    const useFeathersMock = {
      service: () => ({
        find: jest.fn(() => []),
        create: jest.fn(),
      }),
    };
    (useFeathers as jest.Mock).mockReturnValue(useFeathersMock);
    // mock useFind
    const useFindMock = {
      data: ref([]),
    };
    const mockRoute = {
      push: jest.fn(),
    };
    const mockRouter = {
      push: jest.fn(),
    };
    (useFind as jest.Mock).mockReturnValue(useFindMock);
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
    // mock useFeathers
    const useFeathersMock = {
      service: () => useFeathersServiceMock,
    };
    (useFeathers as jest.Mock).mockReturnValue(useFeathersMock);
    // mock useFind
    const useFindMock = {
      data: ref([]),
    };
    const mockRoute = {
      push: jest.fn(),
    };
    const mockRouter = {
      push: jest.fn(),
    };
    (useFind as jest.Mock).mockReturnValue(useFindMock);
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
});
