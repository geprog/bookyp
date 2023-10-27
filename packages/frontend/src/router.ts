import { App, URLOpenListenerEvent } from '@capacitor/app';
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
    name: 'space-loader',
    component: () => import('~/views/space/SpaceLoader.vue'),
    props: true,
    children: [
      {
        path: '',
        name: 'space',
        redirect: { name: 'bookables-map' },
      },
      {
        path: 'info',
        name: 'space-info',
        component: () => import('~/views/space/SpaceInfo.vue'),
        meta: { accessibleByUserRole: true, authentication: 'ignored' },
      },
      {
        path: 'bookables/map',
        name: 'bookables-map',
        meta: { accessibleByUserRole: true, authentication: 'ignored' },
        component: () => import('~/views/space/BookablesMap.vue'),
      },
      {
        path: 'bookables/list',
        name: 'bookables-list',
        meta: { accessibleByUserRole: true, authentication: 'ignored' },
        component: () => import('~/views/space/BookablesList.vue'),
      },
      {
        path: 'bookables/filter',
        name: 'bookables-filter',
        meta: { accessibleByUserRole: true, authentication: 'ignored' },
        component: () => import('~/views/space/BookablesFilter.vue'),
      },
      {
        path: 'bookable/:bookableId/booking',
        meta: { accessibleByUserRole: true },
        component: () => import('~/views/space/booking/BookingCreate.vue'),
        props: true,
        children: [
          {
            path: '',
            name: 'booking-create',
            meta: { accessibleByUserRole: true },
            component: () => import('~/views/space/booking/BookingSelectDate.vue'),
            props: true,
          },
          {
            path: 'edit/:bookingId',
            name: 'booking-edit',
            meta: { accessibleByUserRole: true },
            component: () => import('~/views/space/booking/BookingEdit.vue'),
            props: true,
          },
          {
            path: 'confirmation',
            name: 'booking-confirm',
            meta: { accessibleByUserRole: true },
            component: () => import('~/views/space/booking/BookingConfirmation.vue'),
            props: true,
          },
        ],
      },
      {
        path: 'settings',
        component: () => import('~/components/layout/RouterView.vue'),
        children: [
          {
            path: '',
            name: 'space-settings',
            component: () => import('~/views/space/settings/SpaceSettings.vue'),
            meta: { accessibleByUserRole: true, authentication: 'ignored' },
          },
          // bookable
          {
            path: 'bookable',
            name: 'settings-bookables',
            component: () => import('~/views/space/settings/bookable/Bookables.vue'),
          },
          {
            path: 'bookable/create',
            name: 'settings-bookable-create',
            component: () => import('~/views/space/settings/bookable/BookableCreate.vue'),
          },
          {
            path: 'bookable/:bookableId',
            name: 'settings-bookable',
            component: () => import('~/views/space/settings/bookable/Bookable.vue'),
            props: true,
          },
          // member
          {
            path: 'member',
            name: 'settings-space-members',
            component: () => import('~/views/space/settings/member/MemberList.vue'),
          },
          {
            path: 'member/:spaceMemberId',
            name: 'settings-space-member',
            component: () => import('~/views/space/settings/member/Member.vue'),
            props: true,
          },
          {
            path: 'member/invite',
            name: 'settings-space-member-invite',
            component: () => import('~/views/space/settings/member/MemberInvite.vue'),
          },
          {
            path: 'member/invite/:invitationId',
            name: 'settings-space-member-invitation',
            component: () => import('~/views/space/settings/member/MemberInvitation.vue'),
            props: true,
          },
          // general settings
          {
            path: 'info',
            name: 'settings-space-info',
            component: () => import('~/views/space/settings/SpaceInfo.vue'),
          },
          {
            path: 'space/edit',
            name: 'settings-space-edit',
            component: () => import('~/views/space/settings/SpaceEdit.vue'),
          },
          // subscription
          {
            path: 'subscription',
            name: 'space-settings-subscription',
            component: () => import('~/views/space/settings/subscription/SpaceSubscription.vue'),
          },
          {
            path: 'subscription/upgrade/:requestPlan',
            name: 'space-settings-subscription-upgrade',
            component: () => import('~/views/space/settings/subscription/SpaceSubscriptionUpgrade.vue'),
            props: true,
          },
          // map editor
          {
            path: 'map-editor/:selectedMapObjectId?',
            name: 'settings-space-map',
            component: () => import('~/views/space/settings/map-editor/MapEditor.vue'),
            props: true,
            children: [
              {
                path: 'edit',
                name: 'settings-map-object',
                component: () => import('~/views/space/settings/map-object/MapObject.vue'),
              },
              {
                path: 'edit/link',
                name: 'settings-map-object-link',
                component: () => import('~/views/space/settings/map-object/MapObject.vue'),
              },
              {
                path: 'edit/link/create-bookable',
                name: 'settings-map-object-link-create-bookable',
                component: () => import('~/views/space/settings/bookable/BookableCreate.vue'),
              },
              {
                path: 'edit/link-http',
                name: 'settings-map-object-url',
                component: () => import('~/views/space/settings/map-object/EditURL.vue'),
              },
              {
                path: 'select-map-object',
                name: 'settings-map-select-map-object-type',
                component: () => import('~/views/space/settings/map-editor/SelectMapObjectType.vue'),
              },
            ],
          },
          {
            path: 'pending-requests',
            name: 'space-pending-requests',
            component: () => import('~/views/space/settings/request/PendingRequests.vue'),
          },
          {
            path: 'bookings-and-request-config',
            name: 'space-bookings-and-requests-configuration',
            meta: { accessibleByUserRole: true },
            component: () => import('~/views/space/settings/request/BookingAndRequestConfiguration.vue'),
          },
          {
            path: 'request-details/:requestId',
            name: 'request-details',
            meta: { accessibleByUserRole: true },
            component: () => import('~/views/space/settings/request/RequestDetails.vue'),
            props: true,
          },
        ],
      },

      // bookings / analytics area
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
    path: '/space/create',
    name: 'space-create',
    meta: { accessibleByUserRole: true },
    component: () => import('~/views/SpaceCreate.vue'),
  },
  {
    path: '/account',
    component: () => import('~/components/layout/RouterView.vue'),
    children: [
      {
        path: '',
        name: 'account',
        meta: { accessibleByUserRole: true },
        component: () => import('~/views/account/Profile.vue'),
      },
      {
        path: 'my-spaces',
        name: 'account-my-spaces',
        meta: { accessibleByUserRole: true },
        component: () => import('~/views/account/MySpaces.vue'),
      },
      {
        path: 'bookings',
        name: 'account-bookings',
        meta: { accessibleByUserRole: true },
        component: () => import('~/views/account/Bookings.vue'),
      },
      {
        path: 'booking/:bookingId',
        name: 'account-booking',
        meta: { accessibleByUserRole: true },
        component: () => import('~/views/account/Booking.vue'),
        props: true,
      },
      {
        path: 'language',
        name: 'account-language',
        meta: { accessibleByUserRole: true },
        component: () => import('~/views/account/SelectLanguage.vue'),
      },
    ],
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
    path: '/spaces/filter',
    name: 'spaces-filter',
    meta: { accessibleByUserRole: true, authentication: 'ignored' },
    component: () => import('~/views/SpacesFilter.vue'),
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
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    meta: { authentication: 'ignored' },
    component: NotFound,
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

void App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
  const url = new URL(event.url);

  url.hostname = 'localhost';
  url.protocol = 'http';

  // full reload to prevent issues with broken websocket connections after app was suspended
  window.location.href = url.toString();
});
