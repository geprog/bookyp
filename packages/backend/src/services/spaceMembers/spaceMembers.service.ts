import { Application, Model } from '@bookyp/core';
import { authenticate } from '@feathersjs/authentication';
import { Id, Params, ServiceMethods } from '@feathersjs/feathers';

import { authorizeWithFreshAbility } from '~/casl';

export const name = 'spaceMembers';

class SpaceMembersService implements ServiceMethods<Model.SpaceMember> {
  app!: Application;

  // eslint-disable-next-line @typescript-eslint/require-await
  async setup(app: Application): Promise<void> {
    this.app = app;
  }

  async find(params: Params): Promise<Model.SpaceMember[]> {
    const { spaceId } = params.query as Partial<Model.SpaceMember>;
    if (spaceId === undefined) {
      throw new Error('spaceId should be defined');
    }
    const space = await this.app.service('spaces').get(spaceId);
    const users = (await this.app.service('users').find({})) as Model.User[];
    return space.members.map((member) => {
      const user = users.find((u) => u._id.toString() === member.userId);
      if (user === undefined) {
        throw new Error('User not found');
      }
      return {
        ...member,
        email: user.email,
        name: user.name,
        spaceId: space._id,
        // TODO: use unique id instead if reusing the userId
        _id: member.userId,
      };
    });
  }

  async get(id: Id, params: Params): Promise<Model.SpaceMember> {
    const { spaceId } = params.query as Partial<Model.SpaceMember>;
    if (spaceId === undefined) {
      throw new Error('spaceId should be defined');
    }
    const space = await this.app.service('spaces').get(spaceId);
    const user = await this.app.service('users').get(id);
    const member = space.members.find((m) => m.userId === id);
    if (member === undefined) {
      throw new Error('Member not found');
    }

    return {
      ...member,
      email: user.email,
      name: user.name,
      spaceId: space._id,
      _id: member.userId,
    };
  }

  async create(data: Partial<Model.SpaceMember>): Promise<Model.SpaceMember> {
    const { email, role, spaceId } = data;

    if (spaceId === undefined) {
      throw new Error('spaceId should be defined');
    }
    if (role === undefined) {
      throw new Error('Role should be defined');
    }

    const users = (await this.app.service('users').find({ query: { email } })) as Model.User[];
    if (users.length === 0) {
      throw new Error('User not found');
    }
    const userId = users[0]._id.toString();

    const space = await this.app.service('spaces').get(spaceId);
    if (space.members.find((member) => member.userId === userId) !== undefined) {
      throw new Error('User already in space');
    }
    space.members.push({
      role,
      userId,
    });
    await this.app.service('spaces').update(spaceId, space);

    const spaceMember = new Model.SpaceMember();
    spaceMember.userId = userId;
    spaceMember.role = role;
    spaceMember.spaceId = spaceId;
    spaceMember._id = userId;

    return spaceMember;
  }

  async update(id: Id, data: Partial<Model.SpaceMember>): Promise<Model.SpaceMember> {
    const { role, spaceId } = data;
    if (spaceId === undefined) {
      throw new Error('spaceId should be defined');
    }
    if (role === undefined) {
      throw new Error('Role should be defined');
    }

    const space = await this.app.service('spaces').get(spaceId);
    const member = space.members.find((m) => m.userId.toString() === id);
    if (member === undefined) {
      throw new Error('Member not found');
    }

    member.role = role;
    await this.app.service('spaces').update(spaceId, space);

    const spaceMember = new Model.SpaceMember();
    spaceMember.userId = id.toString();
    spaceMember.role = role || 'user';
    spaceMember.spaceId = spaceId;
    spaceMember._id = id.toString();
    return spaceMember;
  }

  async remove(id: Id, params: Params): Promise<Model.SpaceMember> {
    const { spaceId } = params.query as Partial<Model.SpaceMember>;
    if (spaceId === undefined) {
      throw new Error('spaceId should be defined');
    }
    const space = await this.app.service('spaces').get(spaceId);
    space.members = space.members.filter((member) => member.userId.toString() !== id);
    await this.app.service('spaces').update(spaceId, space);

    const deletedMember = new Model.SpaceMember();
    deletedMember.userId = id.toString();
    deletedMember.role = 'user';
    deletedMember.spaceId = space._id;
    deletedMember._id = id.toString();
    return deletedMember;
  }

  patch(): Promise<Model.SpaceMember> {
    throw new Error('Method not implemented.');
  }
}

export default (app: Application): void => {
  app.use(name, new SpaceMembersService());
  app.service(name).hooks({
    before: {
      all: [authenticate('jwt'), authorizeWithFreshAbility],
    },
    after: {
      all: [authorizeWithFreshAbility],
    },
  });
};
