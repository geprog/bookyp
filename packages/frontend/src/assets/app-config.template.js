(function (window) {
  window.env = window.env || {};

  // Environment variables
  window['env']['BACKEND_URL'] = '${FRONTEND_BACKEND_URL}';
  window['env']['SSO_AUTH_URL'] = '${BACKEND_KEYCLOAK_SUBDOMAIN}';
  window['env']['SSO_AUTH_LOGOUT_ENDPOINT'] = '${BACKEND_KEYCLOAK_LOGOUT_ENDPOINT}';
})(this);
