import { Component } from 'vue';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

import { isAuthenticated, reAuthenticate } from '~/compositions/useAuthentication';
import NotFound from '~/views/NotFound.vue';

declare module 'vue-router' {
  interface RouteMeta {
    authEndpoint?: boolean;
    requiresAuth?: boolean;
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    meta: { requiresAuth: true },
    redirect: { name: 'bookables-map' },
  },
  {
    path: '/',
    meta: { requiresAuth: true },
    component: (): Component => import('~/views/SpaceLoader.vue'),
    children: [
      {
        path: '/bookables/map',
        name: 'bookables-map',
        meta: { requiresAuth: true },
        component: (): Component => import('~/views/BookablesMap.vue'),
      },
      {
        path: '/bookables/list',
        name: 'bookables-list',
        meta: { requiresAuth: true },
        component: (): Component => import('~/views/BookablesList.vue'),
      },
      {
        path: '/bookables/filter',
        name: 'bookables-filter',
        meta: { requiresAuth: true },
        component: (): Component => import('./views/BookablesFilter.vue'),
      },
      {
        path: '/account/bookings',
        name: 'account-bookings',
        meta: { requiresAuth: true },
        component: (): Component => import('~/views/account/Bookings.vue'),
      },
      {
        path: '/account/booking/:bookingId',
        name: 'account-booking',
        meta: { requiresAuth: true },
        component: (): Component => import('~/views/account/Booking.vue'),
        props: true,
      },
      {
        path: '/settings/bookables',
        name: 'settings-bookables',
        meta: { requiresAuth: true },
        component: (): Component => import('~/views/settings/Bookables.vue'),
      },
      {
        path: '/settings/space/members',
        name: 'settings-space-members',
        meta: { requiresAuth: true },
        component: (): Component => import('~/views/settings/SpaceMemberList.vue'),
      },
      {
        path: '/settings/space/member/:spaceMemberId',
        name: 'settings-space-member',
        meta: { requiresAuth: true },
        component: (): Component => import('~/views/settings/SpaceMember.vue'),
        props: true,
      },
      {
        path: '/settings/space/member/invite',
        name: 'settings-space-member-invite',
        meta: { requiresAuth: true },
        component: (): Component => import('~/views/settings/SpaceMemberInvite.vue'),
      },
      {
        path: '/settings/space/member/invite/:invitationId',
        name: 'settings-space-member-invitation',
        meta: { requiresAuth: true },
        component: (): Component => import('~/views/settings/SpaceMemberInvitation.vue'),
        props: true,
      },
      {
        path: '/settings/bookable/create',
        name: 'settings-bookable-create',
        meta: { requiresAuth: true },
        component: (): Component => import('~/views/settings/BookableCreate.vue'),
      },
      {
        path: '/settings/bookable/:bookableId',
        name: 'settings-bookable',
        component: (): Component => import('~/views/settings/Bookable.vue'),
        props: true,
      },
      {
        path: '/settings/space/edit',
        name: 'settings-space-edit',
        meta: { requiresAuth: true },
        component: (): Component => import('~/views/settings/SpaceEdit.vue'),
      },
      {
        path: '/settings/space/map/:selectedMapObjectId?',
        name: 'settings-space-map',
        component: (): Component => import('./views/settings/Space.vue'),
        props: true,
        children: [
          {
            path: 'edit',
            name: 'settings-map-object',
            component: (): Component => import('./views/settings/map-object/MapObject.vue'),
          },
          {
            path: 'edit/link',
            name: 'settings-map-object-link',
            component: (): Component => import('./views/settings/map-object/MapObject.vue'),
          },
        ],
      },
      {
        path: '/bookable/:bookableId/book',
        name: 'booking-create',
        component: (): Component => import('~/views/Booking.vue'),
        props: true,
      },
    ],
  },
  {
    path: '/spaces',
    name: 'spaces-list',
    meta: { requiresAuth: true },
    component: (): Component => import('~/views/settings/SpaceList.vue'),
  },
  {
    path: '/spaces/create',
    name: 'space-create',
    meta: { requiresAuth: true },
    component: (): Component => import('~/views/settings/SpaceCreate.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound,
  },
  {
    path: '/auth/callback',
    name: 'auth-callback',
    meta: { authEndpoint: true },
    component: (): Component => import('~/views/auth/Callback.vue'),
  },
  {
    path: '/auth/login',
    name: 'auth-login',
    meta: { authEndpoint: true },
    component: (): Component => import('~/views/auth/Login.vue'),
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

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    localStorage.setItem('bookyp.redirectAfterAuth', to.fullPath);
    next({ name: 'auth-login' });
    return;
  }

  if (to.meta.authEndpoint && isAuthenticated.value) {
    // user is already authenticated, to prevent unnecessary authentication redirect to home
    next({ name: 'home' });
    return;
  }

  next();
});

export default router;
