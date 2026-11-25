// https://nuxt.com/docs/api/configuration/nuxt-config
import process from 'node:process';

export default defineNuxtConfig({
  compatibilityDate: '2025-01-27',
  devtools: { enabled: !process.env.CI && !process.env.E2E },
  telemetry: false,
  ssr: false,
  modules: ['@nuxt/ui', '@nuxtjs/i18n', 'nuxt-auth-utils', '@vueuse/nuxt', '@vite-pwa/nuxt'],
  // the app is light only like v1: without the color mode module the body does not follow a dark system scheme
  // (which turned the scrollbars and native form controls dark)
  ui: { colorMode: false },
  $development: {
    runtimeConfig: { authHandler: 'dummy' },
  },
  css: ['~/assets/css/main.css'],
  components: [{ path: '~/components', pathPrefix: false }],
  icon: {
    // the icon set of bookyp v1, used as `i-bookyp-<name>`
    customCollections: [{ prefix: 'bookyp', dir: './app/assets/icons' }],
  },
  vite: {
    optimizeDeps: {
      // maplibre loads its worker relative to its own module url, which breaks when vite pre-bundles it
      exclude: ['maplibre-gl'],
    },
    server: {
      // the dev server only answers localhost, `pnpm tunnel` makes it reachable for payment webhooks
      allowedHosts: ['.trycloudflare.com'],
    },
  },
  app: {
    head: {
      title: 'BOOKYP - Book your place',
      titleTemplate: '%s',
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        { name: 'description', content: 'Book your place easily.' },
        { name: 'theme-color', content: '#111827' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      ],
      script: [
        // umami analytics (same as v1), only counts on the production domain and respects do not track
        {
          'src': 'https://hogwarts.geprog.com/main.js',
          'async': true,
          'defer': true,
          'data-website-id': 'a5ee6a89-6ead-4d42-9379-f94a04158298',
          'data-do-not-track': 'true',
          'data-domains': 'app.bookyp.de',
        },
      ],
    },
  },
  routeRules: {
    // basic hardening for every response (HSTS belongs to the ingress, which terminates TLS);
    // framing is allowed for the own origin only, the Nuxt devtools show the app in an iframe
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': 'frame-ancestors \'self\'',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    },
  },
  typescript: {
    strict: true,
  },
  i18n: {
    locales: [
      { code: 'en', language: 'en', file: 'en.json' },
      { code: 'de', language: 'de', file: 'de.json' },
    ],
    strategy: 'no_prefix',
    defaultLocale: 'en',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'bookyp_locale',
      fallbackLocale: 'en',
    },
  },
  pwa: {
    // like v1 the user is asked before a new version is installed (`UpdateApp`)
    registerType: 'prompt',
    includeAssets: ['favicon.ico', 'favicon.svg'],
    manifest: {
      name: 'BOOKYP - Book your place easily',
      short_name: 'BOOKYP',
      description: 'Book your place easily',
      display: 'standalone',
      theme_color: '#f59e0b',
      background_color: '#ffffff',
      icons: [
        { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: '/pwa-maskable-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
        { src: '/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      // api responses must never be served from the service worker cache
      navigateFallbackDenylist: [/^\/api\//, /^\/auth\//],
      globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
    },
    client: {
      installPrompt: false,
    },
    devOptions: {
      enabled: false,
    },
  },
  runtimeConfig: {
    // all values can be overridden with NUXT_* environment variables, see .env.example
    // 'keycloak' | 'dummy' (a login page with test users for local development and tests, no identity provider)
    authHandler: 'keycloak',
    session: {
      password: '',
      maxAge: 60 * 60 * 24 * 30,
    },
    oauth: {
      keycloak: {
        clientId: '',
        clientSecret: '',
        serverUrl: '',
        serverUrlInternal: '',
        realm: '',
        redirectURL: '',
      },
    },
    mongodbUri: '',
    // comma separated list of e-mail addresses that get super admin rights
    superAdminEmails: 'hello@bookyp.de,a.bracke@geprog.com',
    mail: {
      host: '',
      port: 25,
      username: '',
      password: '',
      from: 'Bookyp <hello@bookyp.de>',
      secure: false,
      requireTls: false,
    },
    s3: {
      endpoint: '',
      port: 443,
      useSsl: true,
      accessKey: '',
      secretKey: '',
      bucket: 'bookyp-files',
    },
    payment: {
      // 'mock' | 'mollie'
      provider: 'mock',
      mollieApiKey: '',
      // vat rate in percent added on top of the net plan prices
      vatRate: 19,
      currency: 'EUR',
    },
    public: {
      // public url the app is reachable at, used for links in mails and payment webhooks;
      // empty (local development): the origin of the request is used
      appUrl: '',
      keycloakAccountUrl: 'https://auth.geprog.com/auth/realms/bookyp/account',
      contactEmail: 'hello@bookyp.de',
      // 'production' | 'review' | 'development'
      environmentType: 'development',
      // baked in at build time
      buildDate: process.env.NUXT_PUBLIC_BUILD_DATE || new Date().toISOString(),
      map: {
        tileServer: 'https://tiles.geprog.com',
      },
    },
  },
});
