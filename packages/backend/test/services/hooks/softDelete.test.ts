import { Application, Model } from '@bookyp/core';
import { feathers } from '@feathersjs/feathers';
import { Service } from 'feathers-memory';

import softDelete from '~/hooks/softDelete';

const initialUsers = [
  { name: 'Jane Doe', key: 'a' },
  { name: 'Jack Doe', key: 'a' },
  { name: 'Jack Doe', key: 'a', deleted: true },
  { name: 'Rick Doe', key: 'b' },
  { name: 'Mick Doe', key: 'b' },
  { name: 'Mick Doe', key: 'b', deleted: true },
];

describe('SoftDelete hook', () => {
  it('should throw error when not used as before hook', async () => {
    expect.assertions(1);
    // given
    const app = feathers().use(
      '/users',
      new Service<Model.Bookable>({
        multi: ['create', 'patch', 'remove'],
      }),
    ) as unknown as Application;

    // when
    const userService = app.service('users');
    userService.hooks({
      after: {
        all: [softDelete],
      },
    });

    // then
    await expect(userService.remove(null)).rejects.toThrow('The softDelete hook can only be used as a before hook!!!');
  });

  it('should not find deleted items', async () => {
    expect.assertions(1);
    // given
    const app = feathers().use(
      '/users',
      new Service<Model.Bookable>({
        multi: ['create', 'patch', 'remove'],
      }),
    ) as unknown as Application;
    const userService = app.service('users');
    userService.hooks({
      before: {
        all: [softDelete],
      },
    });
    await userService.create(initialUsers);

    // when
    const user = await userService.find();

    // then
    expect(user).toStrictEqual([
      { name: 'Jane Doe', key: 'a', id: 0 },
      { name: 'Jack Doe', key: 'a', id: 1 },
      { name: 'Rick Doe', key: 'b', id: 3 },
      { name: 'Mick Doe', key: 'b', id: 4 },
    ]);
  });

  it('should call patch when method is remove', async () => {
    expect.assertions(1);
    // given
    const app = feathers().use(
      '/users',
      new Service<Model.Bookable>({
        multi: ['create', 'patch', 'remove'],
      }),
    ) as unknown as Application;
    const userService = app.service('users');
    userService.hooks({
      before: {
        all: [softDelete],
      },
    });
    vi.spyOn(userService, 'patch');

    // when
    await userService.remove(null);

    // then
    expect(userService.patch).toHaveBeenCalledWith(null, { deleted: true }, expect.any(Object));
  });
});
