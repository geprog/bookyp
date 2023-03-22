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

  const userReadableSpaceProperties = [
    '_id',
    'floorPlan',
    'name',
    'description',
    'generalInformation',
    'address',
    'plan',
    'image',
    'coordinates',
    'importId',
  ];
  // read access public spaces for everyone (authorized and unauthorized)
  can('read', 'spaces', userReadableSpaceProperties, {
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

    // users can access payment services
    can(['read', 'update'], 'paymentCustomers');
    can(['read', 'create', 'delete'], 'payment-methods');

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
    // can('read', 'upload-files', { space: { $in: publicSpaceIds } });

    // access to spaces where you are a member of
    const spaceIdsUser = getSpaceIds('user');
    can('read', 'spaces', userReadableSpaceProperties, {
      members: { $elemMatch: { role: 'user', userId: user._id } },
    });
    can('read', 'mapObjects', { space: { $in: spaceIdsUser } });
    can('read', 'bookables', { space: { $in: spaceIdsUser } });
    can(['create', 'update'], 'bookings', { bookedBy: user._id, space: { $in: spaceIdsUser } });
    can('read', 'bookings', ['_id', 'start', 'end', 'bookable', 'space'], {
      bookedBy: { $ne: user._id },
      space: { $in: spaceIdsUser },
    });
    // can('read', 'upload-files', { space: { $in: spaceIdsUser } });

    // admin access to spaces you are an admin of
    const spaceIdsAdmin = getSpaceIds('admin');
    // this cannot rule ensures that admins work properly for public spaces
    cannot('read', 'spaces', userReadableSpaceProperties, {
      members: { $elemMatch: { role: 'admin', userId: user._id } },
      plan: 'public',
    });
    can(['read', 'delete'], 'spaces', { members: { $elemMatch: { role: 'admin', userId: user._id } } });
    can(
      'update',
      'spaces',
      [
        'floorPlan',
        'members',
        'name',
        'description',
        'generalInformation',
        'address',
        'email',
        'deleted',
        'plan',
        'image',
        'coordinates',
      ],
      {
        members: { $elemMatch: { role: 'admin', userId: user._id } },
      },
    );
    can(['read', 'create', 'update', 'remove'], 'mapObjects', { space: { $in: spaceIdsAdmin } });
    can(['read', 'create', 'update', 'remove'], 'bookables', { space: { $in: spaceIdsAdmin } });
    can('read', 'bookings', ['_id', 'start', 'end', 'bookable', 'space', 'bookedBy'], {
      bookedBy: { $ne: user._id },
      space: { $in: spaceIdsAdmin },
    });
    can(['create', 'update'], 'bookings', { bookedBy: user._id, space: { $in: spaceIdsAdmin } });
    can(['read', 'create', 'remove', 'update'], 'invitations', { spaceId: { $in: spaceIdsAdmin } });
    can(['read', 'patch'], 'spaceSubscriptions', { space: { $in: spaceIdsAdmin } });
    can(['read', 'create'], 'upload-files', { spaceId: { $in: spaceIdsAdmin } });
    can('read', 'invoices', { space: { $in: spaceIdsAdmin } });
    can('read', 'invoice-download', { space: { $in: spaceIdsAdmin } });

    const bookingsAdmin = (await app.service('bookings').find({
      query: { space: { $in: spaceIdsAdmin } },
    })) as Model.Booking[];
    can('read', 'users', ['_id', 'email', 'name'], {
      _id: { $in: bookingsAdmin.map((booking) => booking.bookedBy).filter((id) => id !== user._id.toString()) },
    });
  }

  return rules;
};

const defineAbilitiesFor = async (user: Model.User | undefined, app: Application): Promise<Ability> => {
  const rules = await defineRulesFor(user, app);

  return makeAbilityFromRules(rules, { resolveAction });
};

export { defineAbilitiesFor, defineRulesFor };
