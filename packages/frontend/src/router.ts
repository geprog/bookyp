import { Component } from 'vue';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

import NotFound from './views/NotFound.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: (): Component => import('./views/Home.vue'),
  },
  {
    path: '/settings/bookables',
    name: 'settings-bookables',
    component: (): Component => import('./views/settings/Bookables.vue'),
  },
  {
    path: '/settings/bookable',
    name: 'settings-bookable-create',
    component: (): Component => import('./views/settings/BookableCreate.vue'),
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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
