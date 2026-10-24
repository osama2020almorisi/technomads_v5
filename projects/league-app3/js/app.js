/* =========================================================
   app.js — Entry point: boots Core, Shared and the current page
   ========================================================= */
(function (global) {
  'use strict';

  var C = global.Core;
  var UI = global.UI;

  function boot() {
    C.Prefs.load();
    global.I18n.setLang(C.Prefs.get('lang'));
    UI.Theme.apply();

    var pageKey = document.body.getAttribute('data-page') || 'home';
    var page = (global.Pages || {})[pageKey];
    var root = document.getElementById('page');

    if (root && !root.children.length) root.innerHTML = UI.Skeleton.page();

    C.State.init().then(function () {
      global.Shared.init();
      if (page && typeof page.init === 'function') {
        try {
          page.init(root);
        } catch (err) {
          console.error(err);
          root.innerHTML = UI.Render.empty('alert', global.I18n.t('error'), String(err.message || err));
        }
      }
      UI.Anim.reveal();
      C.State.subscribe(function () {
        if (page && typeof page.onData === 'function') {
          try { page.onData(root); } catch (err) { console.error(err); }
        }
      });
    }).catch(function (err) {
      console.error(err);
      if (root) root.innerHTML = UI.Render.empty('alert', global.I18n.t('error'), String(err.message || err));
    });
  }

  global.Pages = global.Pages || {};

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
