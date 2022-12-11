import { Application, Model, resolveAction } from '@bookyp/core';
import { ExtractSubjectType, MongoQuery, Subject, SubjectRawRule } from '@casl/ability';
import { Ability, AbilityBuilder, makeAbilityFromRules } from 'feathers-casl';

const defineRulesFor = async (
  user: Model.User | undefined,
  app: Application,
): Promise<SubjectRawRule<string, ExtractSubjectType<Subject>, MongoQuery<unknown>>[]> => {
  // also see https://casl.js.org/v5/en/guide/define-rules

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { can, cannot, rules } = new AbilityBuilder(Ability);

  const publicSpaces = (await app.service('spaces').find({
    query: { plan: 'public' },
    paginate: false,
  })) as Model.Space[];

  const publicSpaceIds = publicSpaces.map((s) => s._id.toString());

  // read access public spaces for everyone (authorized and unauthorized)
  can('read', 'spaces', ['_id', 'floorPlan', 'name', 'description', 'address', 'plan'], {
    plan: 'public',
  });
  can('read', 'mapObjects', { space: { $in: publicSpaceIds } });
  can('read', 'bookables', { space: { $in: publicSpaceIds } });
  can('read', 'bookings', ['_id', 'start', 'end', 'bookable', 'space'], {
    space: { $in: publicSpaceIds },
  });

  if (user) {
    const spaces = (await app.service('spaces').find({
      query: { members: { $elemMatch: { userId: user._id } } },
    })) as Model.Space[];

    const getSpaceIds = (role: string) => {
      const spacesWhereUserHasRole = spaces.filter((space) =>
        space.members.some((member) => member.role === role && member.userId === user._id.toString()),
      );
      return spacesWhereUserHasRole.map((space) => space._id.toString());
    };

    // access your own user
    can('get', 'users', { _id: user._id });
    can('update', 'users', ['starredSpaces'], { _id: user._id });

    // as a user you can create spaces
    can('create', 'spaces');

    // access own bookings & invitations
    cannot('read', 'bookings', ['_id', 'start', 'end', 'bookable', 'space'], {
      space: { $in: publicSpaceIds },
    });
    can(['read', 'remove'], 'bookings', { bookedBy: user._id });
    can(['read', 'remove'], 'invitations', { email: user.email });

    // write access to public spaces
    can(['create', 'update'], 'bookings', { bookedBy: user._id, space: { $in: publicSpaceIds } });

    // access to spaces where you are a member of
    const spaceIdsUser = getSpaceIds('user');
    can('read', 'spaces', ['_id', 'floorPlan', 'name', 'description', 'address', 'plan'], {
      members: { $elemMatch: { role: 'user', userId: user._id } },
    });
    can('read', 'mapObjects', { space: { $in: spaceIdsUser } });
    can('read', 'bookables', { space: { $in: spaceIdsUser } });
    can(['create', 'update'], 'bookings', { bookedBy: user._id, space: { $in: spaceIdsUser } });
    can('read', 'bookings', ['_id', 'start', 'end', 'bookable', 'space'], {
      bookedBy: { $ne: user._id },
      space: { $in: spaceIdsUser },
    });

    // admin access to spaces you are an admin of
    const spaceIdsAdmin = getSpaceIds('admin');
    // this cannot rule ensures that admins work properly for public spaces
    cannot('read', 'spaces', ['_id', 'floorPlan', 'name', 'description', 'address', 'plan'], {
      members: { $elemMatch: { role: 'admin', userId: user._id } },
      plan: 'public',
    });
    can(['read', 'delete'], 'spaces', { members: { $elemMatch: { role: 'admin', userId: user._id } } });
    can('update', 'spaces', ['floorPlan', 'members', 'name', 'description', 'address', 'email', 'deleted', 'plan'], {
      members: { $elemMatch: { role: 'admin', userId: user._id } },
    });
    can(['read', 'create', 'update', 'remove'], 'mapObjects', { space: { $in: spaceIdsAdmin } });
    can(['read', 'create', 'update', 'remove'], 'bookables', { space: { $in: spaceIdsAdmin } });
    can('read', 'bookings', ['_id', 'start', 'end', 'bookable', 'space', 'bookedBy'], {
      bookedBy: { $ne: user._id },
      space: { $in: spaceIdsAdmin },
    });
    can(['create', 'update'], 'bookings', { bookedBy: user._id, space: { $in: spaceIdsAdmin } });
    can(['read', 'create', 'remove', 'update'], 'invitations', { spaceId: { $in: spaceIdsAdmin } });
  }

  return rules;
};

const defineAbilitiesFor = async (user: Model.User | undefined, app: Application): Promise<Ability> => {
  const rules = await defineRulesFor(user, app);

  return makeAbilityFromRules(rules, { resolveAction });
};

export { defineAbilitiesFor, defineRulesFor };
