/* ============================================================
   store.js — إدارة حالة التطبيق + localStorage
   ============================================================ */
const Store = (() => {
  const SETTINGS_KEY = 'bidaya_settings_v1';

  const defaults = {
    theme: 'system',         // light / dark / system
    fontSize: 'medium',      // small / medium / large / xlarge
    fontFamily: 'naskh',     // naskh / amiri / cairo
    paper: 'cream',          // white / cream / dark
    resultsPerPage: 20,
    lineHeight: 1.8,
    pageSize: 2000,          // عدد الأحرف لكل صفحة معروضة
  };

  let _settings = null;
  let _book = null;
  let _chapters = null;      // cache
  let _stats = null;

  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      _settings = { ...defaults, ...(raw ? JSON.parse(raw) : {}) };
    } catch (_) {
      _settings = { ...defaults };
    }
    return _settings;
  }

  function get(key) {
    if (!_settings) loadSettings();
    return _settings[key];
  }

  function set(key, value) {
    if (!_settings) loadSettings();
    _settings[key] = value;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(_settings));
  }

  function reset() {
    _settings = { ...defaults };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(_settings));
  }

  function all() {
    if (!_settings) loadSettings();
    return { ..._settings };
  }

  // ─── Cache ───
  function setBook(b) { _book = b; }
  function getBook() { return _book; }

  function setChapters(c) { _chapters = c; }
  function getChapters() { return _chapters; }

  function setStats(s) { _stats = s; }
  function getStats() { return _stats; }

  return {
    loadSettings, get, set, reset, all,
    setBook, getBook,
    setChapters, getChapters,
    setStats, getStats,
  };
})();
