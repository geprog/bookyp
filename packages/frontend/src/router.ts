import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

import { savedSpaceId } from '~/compositions/space/useCurrentSpace';
import { isAuthenticated, reAuthenticate } from '~/compositions/useAuthentication';
import NotFound from '~/views/NotFound.vue';

declare module 'vue-router' {
  interface RouteMeta {
    authentication?: 'ignored' | 'required' | 'unauthenticated-only';
    accessibleByUserRole?: boolean;
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    redirect: () =>
      savedSpaceId.value ? { name: 'bookables-map', params: { spaceId: savedSpaceId.value } } : { name: 'spaces-list' },
  },
  {
    path: '/space/:spaceId',
    component: () => import('~/views/SpaceLoader.vue'),
    props: true,
    children: [
      {
        path: '',
        name: 'space',
        redirect: { name: 'bookables-map' },
      },
      {
        path: 'bookables/map',
        name: 'bookables-map',
        meta: { accessibleByUserRole: true, authentication: 'ignored' },
        component: () => import('~/views/BookablesMap.vue'),
      },
      {
        path: 'bookables/list',
        name: 'bookables-list',
        meta: { accessibleByUserRole: true, authentication: 'ignored' },
        component: () => import('~/views/BookablesList.vue'),
      },
      {
        path: 'bookables/filter',
        name: 'bookables-filter',
        meta: { accessibleByUserRole: true, authentication: 'ignored' },
        component: () => import('./views/BookablesFilter.vue'),
      },
      {
        path: 'bookable/:bookableId/book',
        name: 'booking-create',
        meta: { accessibleByUserRole: true },
        component: () => import('~/views/Booking.vue'),
        props: true,
      },
      {
        path: 'settings/bookables',
        name: 'settings-bookables',
        component: () => import('~/views/settings/Bookables.vue'),
      },
      {
        path: 'settings/space/members',
        name: 'settings-space-members',
        component: () => import('~/views/settings/SpaceMemberList.vue'),
      },
      {
        path: 'settings/space/member/:spaceMemberId',
        name: 'settings-space-member',
        component: () => import('~/views/settings/SpaceMember.vue'),
        props: true,
      },
      {
        path: 'settings/space/member/invite',
        name: 'settings-space-member-invite',
        component: () => import('~/views/settings/SpaceMemberInvite.vue'),
      },
      {
        path: 'settings/space/member/invite/:invitationId',
        name: 'settings-space-member-invitation',
        component: () => import('~/views/settings/SpaceMemberInvitation.vue'),
        props: true,
      },
      {
        path: 'settings/bookable/create',
        name: 'settings-bookable-create',
        component: () => import('~/views/settings/BookableCreate.vue'),
      },
      {
        path: 'settings/bookable/:bookableId',
        name: 'settings-bookable',
        component: () => import('~/views/settings/Bookable.vue'),
        props: true,
      },
      {
        path: 'settings/space/info',
        name: 'settings-space-info',
        component: () => import('~/views/settings/SpaceInfo.vue'),
      },
      {
        path: 'info',
        name: 'space-info',
        component: () => import('~/views/space/SpaceInfo.vue'),
        meta: { accessibleByUserRole: true, authentication: 'ignored' },
      },
      {
        path: 'settings/space/edit',
        name: 'settings-space-edit',
        component: () => import('~/views/settings/SpaceEdit.vue'),
      },
      {
        path: 'settings/space/map/:selectedMapObjectId?',
        name: 'settings-space-map',
        component: () => import('./views/settings/Space.vue'),
        props: true,
        children: [
          {
            path: 'edit',
            name: 'settings-map-object',
            component: () => import('./views/settings/map-object/MapObject.vue'),
          },
          {
            path: 'edit/link',
            name: 'settings-map-object-link',
            component: () => import('./views/settings/map-object/MapObject.vue'),
          },
          {
            path: 'edit/link/create-bookable',
            name: 'settings-map-object-link-create-bookable',
            component: () => import('~/views/settings/BookableCreate.vue'),
          },
          {
            path: 'select-map-object',
            name: 'settings-map-select-map-object-type',
            component: () => import('~/views/settings/SelectMapObjectType.vue'),
          },
        ],
      },
      {
        path: 'bookings',
        name: 'space-bookings',
        redirect: { name: 'space-bookings-calendar' },
      },
      {
        path: 'bookings/calendar',
        name: 'space-bookings-calendar',
        component: () => import('~/views/space/bookings/SpaceBookingsCalendar.vue'),
      },
      {
        path: 'bookings/members',
        name: 'space-bookings-members',
        component: () => import('~/views/space/bookings/SpaceMembers.vue'),
      },
      {
        path: 'bookings/member/:spaceMemberId/booking',
        name: 'space-member-bookings',
        component: () => import('~/views/space/bookings/SpaceMemberBookings.vue'),
      },
    ],
  },
  {
    path: '/account/bookings',
    name: 'account-bookings',
    meta: { accessibleByUserRole: true },
    component: () => import('~/views/account/Bookings.vue'),
  },
  {
    path: '/account/booking/:bookingId',
    name: 'account-booking',
    meta: { accessibleByUserRole: true },
    component: () => import('~/views/account/Booking.vue'),
    props: true,
  },
  {
    path: '/spaces',
    name: 'spaces-list',
    meta: { accessibleByUserRole: true, authentication: 'ignored' },
    component: () => import('~/views/SpacesList.vue'),
  },
  {
    path: '/spaces/map/:selectedSpaceId?',
    name: 'spaces-map',
    meta: { accessibleByUserRole: true, authentication: 'ignored' },
    component: () => import('~/views/SpacesMap.vue'),
    props: true,
  },
  {
    path: '/spaces/create',
    name: 'space-create',
    meta: { accessibleByUserRole: true },
    component: () => import('~/views/settings/SpaceCreate.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    meta: { authentication: 'ignored' },
    component: NotFound,
  },
  {
    path: '/auth/callback',
    name: 'auth-callback',
    meta: { authentication: 'unauthenticated-only' },
    component: () => import('~/views/auth/Callback.vue'),
  },
  {
    path: '/auth/login',
    name: 'auth-login',
    meta: { authentication: 'unauthenticated-only' },
    component: () => import('~/views/auth/Login.vue'),
  },
  {
    path: '/features',
    name: 'features',
    meta: { authentication: 'ignored' },
    component: () => import('~/views/Features.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// auth middleware
router.beforeEach(async (to, _, next) => {
  // do not load authentication in callback
  if (to.name === 'auth-callback') {
    next();
    return;
  }

  await reAuthenticate();

  const authentication = (to.meta.authentication as string | undefined) || 'required';

  if (authentication === 'ignored') {
    next();
    return;
  }

  if (authentication === 'required' && !isAuthenticated.value) {
    localStorage.setItem('bookyp.redirectAfterAuth', to.fullPath);
    next({ name: 'auth-login' });
    return;
  }

  if (authentication === 'unauthenticated-only' && isAuthenticated.value) {
    // user is already authenticated, to prevent unnecessary authentication redirect to home
    next({ name: 'home' });
    return;
  }

  next();
});

export default router;
