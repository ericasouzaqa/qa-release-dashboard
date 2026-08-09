(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const page = document.body.dataset.page;

    Storage.loadData();

    if (page === 'dashboard') {
      Release.initDashboard();
    }
  });
})();
