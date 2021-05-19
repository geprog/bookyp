import { Component } from 'vue';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

import { isAuthenticated, load as loadAuthentication } from '~/compositions/useAuthentication';

import NotFound from './views/NotFound.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    meta: { requiresAuth: true },
    component: (): Component => import('./views/Home.vue'),
  },
  {
    path: '/settings/bookables',
    name: 'settings-bookables',
    meta: { requiresAuth: true },
    component: (): Component => import('./views/settings/Bookables.vue'),
  },
  {
    path: '/settings/bookable/create',
    name: 'settings-bookable-create',
    meta: { requiresAuth: true },
    component: (): Component => import('./views/settings/BookableCreate.vue'),
  },
  {
    path: '/settings/bookable/:bookableId',
    name: 'settings-bookable',
    component: (): Component => import('./views/settings/Bookable.vue'),
    props: true,
  },
  {
    path: '/settings/space/:selectedMapObjectId?',
    name: 'settings-space',
    component: (): Component => import('./views/settings/Space.vue'),
    props: true,
  },
  {
    path: '/bookable/:bookableId/book',
    name: 'booking-create',
    component: (): Component => import('./views/Booking.vue'),
    props: true,
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
    component: (): Component => import('./views/auth/Callback.vue'),
  },
  {
    path: '/auth/loading-screen',
    name: 'loading-screen',
    meta: { authEndpoint: true },
    component: (): Component => import('./views/auth/LoadingScreen.vue'),
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

  await loadAuthentication();

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next({ name: 'loading-screen' });
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
