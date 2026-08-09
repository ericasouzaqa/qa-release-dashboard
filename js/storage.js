(function () {
  'use strict';

  const KEY = 'qa-release-dashboard-v120';

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function loadData() {
    const raw = localStorage.getItem(KEY);

    if (!raw) {
      const seed = clone(window.QASeedData);
      localStorage.setItem(KEY, JSON.stringify(seed));
      return seed;
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      const seed = clone(window.QASeedData);
      localStorage.setItem(KEY, JSON.stringify(seed));
      return seed;
    }
  }

  function saveData(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function reset() {
    localStorage.removeItem(KEY);
    localStorage.removeItem('qa-release-session');
    location.reload();
  }

  window.Storage = {
    loadData,
    saveData,
    reset,
  };
})();
