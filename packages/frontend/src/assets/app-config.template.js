(function (window) {
  window.env = window.env || {};

  // Environment variables
  window['env']['BACKEND_URL'] = '${APP_BACKEND_URL}';
})(this);
