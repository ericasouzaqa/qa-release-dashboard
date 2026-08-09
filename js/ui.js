(function () {
  'use strict';

  function escape(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatMultiline(value) {
    return escape(value).replace(/\n/g, '<br>');
  }

  function toast(message, type) {
    const root = document.getElementById('toast-root');

    if (!root) return;

    const element = document.createElement('div');
    element.className = `toast ${type || 'success'}`;
    element.textContent = message;

    root.appendChild(element);

    setTimeout(function () {
      element.classList.add('hide');

      setTimeout(function () {
        element.remove();
      }, 250);
    }, 3000);
  }

  function openModal(content, options) {
    const root = document.getElementById('modal-root');

    if (!root) return;

    const config = options || {};

    root.innerHTML = `
      <div class="modal-backdrop" data-modal-backdrop>
        <div class="modal ${config.size === 'lg' ? 'modal-lg' : ''}" role="dialog">
          <div class="modal-header">
            <h2>${escape(config.title || '')}</h2>
            <button type="button" class="modal-close" data-modal-close aria-label="Fechar">×</button>
          </div>
          <div class="modal-body">
            ${content}
          </div>
        </div>
      </div>
    `;

    root.querySelectorAll('[data-modal-close]').forEach(function (button) {
      button.addEventListener('click', closeModal);
    });

    root
      .querySelector('[data-modal-backdrop]')
      ?.addEventListener('click', function (event) {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      });
  }

  function closeModal() {
    const root = document.getElementById('modal-root');

    if (root) {
      root.innerHTML = '';
    }
  }

  function confirmAction(message) {
    return window.confirm(message);
  }

  function formatDate(value) {
    if (!value) return '—';

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString('pt-BR');
  }

  window.UI = {
    escape,
    formatMultiline,
    toast,
    openModal,
    closeModal,
    confirmAction,
    formatDate,
  };
})();
