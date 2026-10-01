// ═══════════════════════════════════════════
//  device-auth.js — token del visor emparejado
//  (la validación real ocurre en el servidor; esto es solo comodidad)
// ═══════════════════════════════════════════
(function () {
  var KEY = 'ldr_device_token';
  var LOGIN = 'login-vr.html';

  // Invitado: el token vive en sessionStorage (se borra al cerrar la pestaña). Dispositivo propio: localStorage.
  function read() {
    try { return sessionStorage.getItem(KEY) || localStorage.getItem(KEY) || ''; } catch (e) { return ''; }
  }

  function expired(token) {
    try {
      var p = JSON.parse(atob(token.split('.')[0].replace(/-/g, '+').replace(/_/g, '/')));
      return !(p.exp > Date.now());
    } catch (e) { return true; }
  }

  window.hasDeviceToken = function () {
    var t = read();
    return !!t && !expired(t);
  };

  window.setDeviceToken = function (token, guest) {
    try {
      if (guest) { sessionStorage.setItem(KEY, token); localStorage.removeItem(KEY); }
      else { localStorage.setItem(KEY, token); sessionStorage.removeItem(KEY); }
      // Claves que world.html usa para el saludo
      localStorage.setItem('ldr_game_id', 'VISOR');
      if (!localStorage.getItem('ldr_uid'))
        localStorage.setItem('ldr_uid', 'visor_' + Math.random().toString(36).slice(2, 11));
    } catch (e) {}
  };

  window.clearDeviceToken = function () {
    try {
      localStorage.removeItem(KEY); sessionStorage.removeItem(KEY);
      localStorage.removeItem('ldr_session_token');
      localStorage.removeItem('ldr_refresh_token');
    } catch (e) {}
  };

  // Redirige al emparejamiento si no hay token válido
  window.requireDeviceToken = function () {
    if (!window.hasDeviceToken()) window.location.href = LOGIN;
  };

  // fetch que agrega el token; si el servidor lo rechaza, vuelve a emparejar
  window.authFetch = function (url, opts) {
    opts = opts || {};
    var headers = new Headers(opts.headers || {});
    headers.set('Authorization', 'Bearer ' + read());
    return fetch(url, Object.assign({}, opts, { headers: headers })).then(function (res) {
      if (res.status === 401) {
        window.clearDeviceToken();
        window.location.href = LOGIN;
      }
      return res;
    });
  };
})();
