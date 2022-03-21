import { Application, Model } from '@bookyp/core';
import { authenticate } from '@feathersjs/authentication';
import { NullableId, Params, ServiceMethods } from '@feathersjs/feathers';
import { authorize } from 'feathers-casl';

export const name = 'spaceMembers';

class SpaceMembersService implements ServiceMethods<Model.SpaceMember> {
  app!: Application;

  // eslint-disable-next-line @typescript-eslint/require-await
  async setup(app: Application): Promise<void> {
    this.app = app;
  }

  async find(params: Params): Promise<Model.SpaceMember[]> {
    const space = await this.app.service('spaces').get(params.query?.spaceId);
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
      };
    });
  }

  get(): Promise<Model.SpaceMember> {
    throw new Error('Method not implemented.');
  }

  async create(data: Partial<Model.SpaceMember>): Promise<Model.SpaceMember> {
    const { email, spaceId } = data;

    if (spaceId === undefined) {
      throw new Error('Space ID not found');
    }

    const users = (await this.app.service('users').find({ query: { email } })) as Model.User[];
    if (users.length === 0) {
      throw new Error('User not found');
    }
    const userId = users[0]._id.toString();

    const space = await this.app.service('spaces').get(spaceId);
    space.members.push({
      role: 'user',
      userId,
    });
    await this.app.service('spaces').update(spaceId, space);

    const spaceMember = new Model.SpaceMember();
    spaceMember.userId = userId;
    spaceMember.role = 'user';
    spaceMember.spaceId = spaceId;

    return spaceMember;
  }

  update(): Promise<Model.SpaceMember> {
    throw new Error('Method not implemented.');
  }

  async remove(id: NullableId, params: Params): Promise<Model.SpaceMember> {
    if (id === null) {
      throw new Error('Space Id not found');
    }

    const space = await this.app.service('spaces').get(params.query?.spaceId);
    space.members = space.members.filter((member) => member.userId.toString() !== id);
    await this.app.service('spaces').update(params.query?.spaceId, space);

    const deletedMember = new Model.SpaceMember();
    deletedMember.userId = id.toString();
    deletedMember.role = 'user';
    deletedMember.spaceId = space._id;
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
      all: [authenticate('jwt'), authorize({ adapter: 'feathers-mongoose' })],
    },
    after: {
      all: [authorize({ adapter: 'feathers-mongoose' })],
    },
  });
};
