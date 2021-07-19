(function (window) {
  window.env = window.env || {};

  // Environment variables
  window['env']['BACKEND_URL'] = '${FRONTEND_BACKEND_URL}';
})(this);
