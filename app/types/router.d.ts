import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    /** `required` (default), `ignored` for public pages, `unauthenticated-only` for the login page */
    auth?: 'ignored' | 'required' | 'unauthenticated-only';
  }
}

declare module '#app' {
  interface PageMeta {
    auth?: 'ignored' | 'required' | 'unauthenticated-only';
  }
}

export {};
