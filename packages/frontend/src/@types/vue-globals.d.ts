import type { RouteLocationNormalizedLoaded, Router } from 'vue-router';

// https://github.com/johnsoncodehk/volar/issues/807
declare module 'vue' {
  export interface ComponentCustomProperties {
    /**
     * Normalized current location. See {@link RouteLocationNormalizedLoaded}.
     */
    $route: RouteLocationNormalizedLoaded;
    /**
     * {@link Router} instance used by the application.
     */
    $router: Router;
  }
}
