import type { Application, Model } from '@bookyp/core';
import { ExtractSubjectType, MongoQuery, Subject, SubjectRawRule } from '@casl/ability';
import { Ability, AbilityBuilder, createAliasResolver, makeAbilityFromRules } from 'feathers-casl';

// don't forget this, as `read` is used internally
const resolveAction = createAliasResolver({
  update: 'patch', // define the same rules for update & patch
  read: ['get', 'find'], // use 'read' as a equivalent for 'get' & 'find'
  delete: 'remove', // use 'delete' or 'remove'
});

const defineRulesFor = async (
  user: Model.User,
  app: Application,
): Promise<SubjectRawRule<string, ExtractSubjectType<Subject>, MongoQuery<unknown>>[]> => {
  // also see https://casl.js.org/v5/en/guide/define-rules

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { can, rules } = new AbilityBuilder(Ability);

  can('get', 'users', { _id: user._id });

  can('read', 'spaces', ['_id', 'floorPlan', 'name', 'description', 'address'], {
    members: { $elemMatch: { role: 'user', userId: user._id } },
  });
  can('read', 'spaces', { members: { $elemMatch: { role: 'admin', userId: user._id } } });
  can('update', 'spaces', ['floorPlan', 'members', 'name', 'description', 'address'], {
    members: { $elemMatch: { role: 'admin', userId: user._id } },
  });
  can('create', 'spaces');

  const spaces = (await app
    .service('spaces')
    .find({ query: { members: { $elemMatch: { userId: user._id } } } })) as Model.Space[];

  const getSpaceIds = (role: string) => {
    const spacesWhereUserHasRole = spaces.filter((space) =>
      space.members.some((member) => member.role === role && member.userId === user._id.toString()),
    );
    return spacesWhereUserHasRole.map((space) => space._id.toString());
  };

  const spaceIdsUser = getSpaceIds('user');
  const spaceIdsAdmin = getSpaceIds('admin');

  can('read', 'bookables', { space: { $in: spaceIdsUser } });
  can(['read', 'create', 'update', 'remove'], 'bookables', { space: { $in: spaceIdsAdmin } });

  can('read', 'mapObjects', { space: { $in: spaceIdsUser } });
  can(['read', 'create', 'update', 'remove'], 'mapObjects', { space: { $in: spaceIdsAdmin } });

  can('read', 'bookings', ['_id', 'start', 'end', 'bookable', 'space'], {
    bookedBy: { $ne: user._id },
    space: { $in: [...spaceIdsUser, ...spaceIdsAdmin] },
  });
  can(['read', 'remove'], 'bookings', { bookedBy: user._id });
  can(['create', 'update'], 'bookings', { bookedBy: user._id, space: { $in: [...spaceIdsUser, ...spaceIdsAdmin] } });

  can(['read', 'create', 'remove', 'update'], 'invitations', { spaceId: { $in: spaceIdsAdmin } });
  can(['read', 'remove'], 'invitations', { email: user.email });

  return rules;
};

const defineAbilitiesFor = async (user: Model.User, app: Application): Promise<Ability> => {
  const rules = await defineRulesFor(user, app);

  return makeAbilityFromRules(rules, { resolveAction });
};

export { defineAbilitiesFor, defineRulesFor };
