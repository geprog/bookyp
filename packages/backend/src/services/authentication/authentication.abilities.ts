import { Application, Model, resolveAction } from '@bookyp/core';
import { ExtractSubjectType, MongoQuery, Subject, SubjectRawRule } from '@casl/ability';
import { Ability, AbilityBuilder, makeAbilityFromRules } from 'feathers-casl';

type LoadedSpaces = {
  publicSpaces: string[];
  userSpaces: string[];
  adminSpaces: string[];
};

/**
 * Loads all the spaces the given user has access to and splits them in public spaces,
 * spaces where user is invited as member and spaces where user is an admin.
 *
 * Thereby it is guaranteed that these 3 subsets are distinct from each other.
 * In other words, each space can be contained in at most one subset.
 *
 * @param user
 * @param app
 */
async function loadSpaces(user: Model.User | undefined, app: Application): Promise<LoadedSpaces> {
  const publicSpaces = (await app.service('spaces').find({
    query: { isPublic: true, ...(user ? { members: { $not: { $elemMatch: { userId: user._id } } } } : {}) },
    paginate: false,
  })) as Model.Space[];
  const publicSpaceIds = publicSpaces.map((s) => s._id.toString());
  if (!user) {
    return {
      publicSpaces: publicSpaceIds,
      userSpaces: [],
      adminSpaces: [],
    };
  }
  const userSpaces = (await app.service('spaces').find({
    query: { members: { $elemMatch: { userId: user._id, role: 'user' } } },
  })) as Model.Space[];
  const adminSpaces = (await app.service('spaces').find({
    query: { members: { $elemMatch: { userId: user._id, role: 'admin' } } },
  })) as Model.Space[];

  return {
    publicSpaces: publicSpaceIds,
    userSpaces: userSpaces.map((s) => s._id.toString()),
    adminSpaces: adminSpaces.map((s) => s._id.toString()),
  };
}

type AbilityContext = {
  user: Model.User | undefined;
  can: AbilityBuilder<Ability>['can'];
  cannot: AbilityBuilder<Ability>['cannot'];
  app: Application;
} & LoadedSpaces;

async function usersServiceAccess({ user, can, adminSpaces, app }: AbilityContext): Promise<void> {
  if (user) {
    // access your own user
    can('get', 'users', { _id: user._id });
    can('update', 'users', ['starredSpaces'], { _id: user._id });
  }

  if (adminSpaces.length > 0) {
    // admins get access to some user information of the people that have booked in their spaces
    const bookingsAdmin = (await app.service('bookings').find({
      query: { space: { $in: adminSpaces } },
      $disableSoftDelete: true,
    })) as Model.Booking[];
    const allowedUserFields = ['_id', 'email', 'name'];
    const allowedUserIds = bookingsAdmin.map((booking) => booking.bookedBy);
    can('find', 'users', allowedUserFields, { _id: { $in: allowedUserIds } });
    if (user) {
      can('get', 'users', allowedUserFields, {
        _id: { $in: allowedUserIds.filter((id) => id !== user._id.toString()) },
      });
    }
  }
}

function spacesServiceAccess({ user, can, publicSpaces, userSpaces, adminSpaces }: AbilityContext): void {
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
    'frequency',
    'isUserMember',
    'phone',
    'website',
    'bookingsAndRequests',
  ];
  // restricted read access to all public spaces and spaces with member access
  can('read', 'spaces', userReadableSpaceProperties, {
    _id: { $in: [...publicSpaces, ...userSpaces] },
  });

  if (adminSpaces.length > 0) {
    // unlimited read and delete access to all spaces with admin access
    can(['read', 'delete'], 'spaces', { _id: { $in: adminSpaces } });

    // restricted update access to not overwrite some internal fields like subscription and so on
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
        'isPublic',
        'phone',
        'website',
        'bookingsAndRequests',
      ],
      { _id: { $in: adminSpaces } },
    );
  }

  if (user) {
    // as a user you can create spaces
    can('create', 'spaces');
  }
}

function invitationsServiceAccess({ user, can, adminSpaces }: AbilityContext): void {
  if (adminSpaces.length > 0) {
    can(['read', 'create', 'remove', 'update'], 'invitations', { spaceId: { $in: adminSpaces } });
  }

  if (user) {
    can(['read', 'remove'], 'invitations', { email: user.email });
  }
}

function mapObjectsServiceAccess({ can, publicSpaces, userSpaces, adminSpaces }: AbilityContext): void {
  can('read', 'mapObjects', { space: { $in: [...publicSpaces, ...userSpaces] } });
  if (adminSpaces.length > 0) {
    can(['read', 'create', 'update', 'remove'], 'mapObjects', { space: { $in: adminSpaces } });
  }
}

function mapObjectTypesServiceAccess({ can, adminSpaces }: AbilityContext): void {
  if (adminSpaces.length > 0) {
    can(['read', 'create', 'remove'], 'mapObjectTypes', { spaceId: { $in: adminSpaces } });
  }
}

function bookablesServiceAccess({ can, publicSpaces, userSpaces, adminSpaces }: AbilityContext): void {
  can('read', 'bookables', { space: { $in: [...publicSpaces, ...userSpaces] } });
  if (adminSpaces.length > 0) {
    can(['read', 'create', 'update', 'remove'], 'bookables', { space: { $in: adminSpaces } });
  }
}

function bookingsServiceAccess({ user, can, publicSpaces, userSpaces, adminSpaces }: AbilityContext): void {
  can('read', 'bookings', ['_id', 'start', 'end', 'bookable', 'space', 'request'], {
    ...(user ? { bookedBy: { $ne: user._id } } : {}),
    space: { $in: [...publicSpaces, ...userSpaces] },
  });

  if (adminSpaces.length > 0) {
    // admins have full access to all bookings in their spaces regardless of who has booked
    can(['read', 'update', 'remove'], 'bookings', { space: { $in: adminSpaces } });
  }

  if (user) {
    can(['read', 'remove'], 'bookings', { bookedBy: user._id });
    can(['create', 'update'], 'bookings', {
      bookedBy: user._id,
      space: { $in: [...publicSpaces, ...userSpaces, ...adminSpaces] },
    });
  }
}

function paymentAndInvoicingServicesAccess({ user, can, adminSpaces }: AbilityContext) {
  if (adminSpaces.length > 0) {
    can(['read', 'patch'], 'spaceSubscriptions', { space: { $in: adminSpaces } });
    can('read', 'invoices', { space: { $in: adminSpaces } });
    can('read', 'invoice-download', { space: { $in: adminSpaces } });
  }

  if (user) {
    // users can access payment services
    can(['read', 'update'], 'paymentCustomers');
    can(['read', 'create', 'delete'], 'payment-methods');
  }
}

function uploadFilesServiceAccess({ can, adminSpaces }: AbilityContext) {
  if (adminSpaces.length > 0) {
    can('create', 'upload-files', { spaceId: { $in: adminSpaces } });
  }
}

const defineRulesFor = async (
  user: Model.User | undefined,
  app: Application,
): Promise<SubjectRawRule<string, ExtractSubjectType<Subject>, MongoQuery<unknown>>[]> => {
  // also see https://casl.js.org/v5/en/guide/define-rules

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { can, cannot, rules } = new AbilityBuilder(Ability);

  if (user?.isSuperAdmin) {
    can('manage', 'all'); // read-write access to everything
    return rules;
  }

  const spaces = await loadSpaces(user, app);

  const context: AbilityContext = {
    ...spaces,
    user,
    can,
    cannot,
    app,
  };

  await usersServiceAccess(context);
  invitationsServiceAccess(context);
  spacesServiceAccess(context);
  mapObjectsServiceAccess(context);
  mapObjectTypesServiceAccess(context);
  bookablesServiceAccess(context);
  bookingsServiceAccess(context);
  paymentAndInvoicingServicesAccess(context);
  uploadFilesServiceAccess(context);

  return rules;
};

const defineAbilitiesFor = async (user: Model.User | undefined, app: Application): Promise<Ability> => {
  const rules = await defineRulesFor(user, app);

  return makeAbilityFromRules(rules, { resolveAction });
};

export { defineAbilitiesFor, defineRulesFor };
