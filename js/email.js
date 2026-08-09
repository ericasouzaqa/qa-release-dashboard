(function () {
  'use strict';

  const DEFAULT_ENDPOINT = '/api/email';

  function openEmailModal(product, version) {
    const data = Storage.loadData();

    const groups = data.emailGroups.filter(function (group) {
      return group.active !== false;
    });

    UI.openModal(
      `
      <form id="email-form">

        <div class="report-summary">
          <strong>${UI.escape(product.name)}</strong>
          <span>Versão ${UI.escape(version.numero)}</span>
        </div>

        <div class="field-group">
          <label for="email-manual">
            E-mails
          </label>

          <textarea
            id="email-manual"
            rows="4"
            placeholder="um@email.com; outro@email.com"
          ></textarea>

          <small>Separe múltiplos e-mails por ponto e vírgula, vírgula ou quebra de linha.</small>
        </div>

        <div class="field-group">
          <label for="email-group">
            Grupo de destinatários
          </label>

          <select id="email-group">
            <option value="">Não usar grupo</option>
            ${groups
              .map(function (group) {
                return `
                <option value="${UI.escape(group.id)}">
                  ${UI.escape(group.name)} (${group.recipients.length})
                </option>
              `;
              })
              .join('')}
          </select>
        </div>

        <div class="modal-inline-actions">
          <button type="button" class="btn btn-secondary" data-modal-close>
            Cancelar
          </button>

          <button type="submit" class="btn btn-primary">
            Enviar relatório
          </button>
        </div>
      </form>
    `,
      {
        title: 'Enviar relatório',
        size: 'lg',
      }
    );

    document
      .getElementById('email-form')
      .addEventListener('submit', async function (event) {
        event.preventDefault();

        const manual = document.getElementById('email-manual').value;
        const groupId = document.getElementById('email-group').value;

        const emails = manual
          .split(/[;,\n]+/)
          .map(function (email) {
            return email.trim().toLowerCase();
          })
          .filter(Boolean);

        const group = groups.find(function (item) {
          return item.id === groupId;
        });

        if (group) {
          group.recipients.forEach(function (recipient) {
            emails.push(recipient.email);
          });
        }

        const uniqueEmails = [...new Set(emails)];

        if (!uniqueEmails.length) {
          UI.toast('Informe pelo menos um destinatário.', 'error');
          return;
        }

        if (uniqueEmails.length > 25) {
          UI.toast('O envio está limitado a 25 destinatários.', 'error');
          return;
        }

        const invalid = uniqueEmails.find(function (email) {
          return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        });

        if (invalid) {
          UI.toast(`E-mail inválido: ${invalid}`, 'error');
          return;
        }

        try {
          const response = await fetch(DEFAULT_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: uniqueEmails,
              product: product.name,
              version: version.numero,
              description: version.descricao,
              items: version.items,
            }),
          });

          if (!response.ok) {
            throw new Error('Servidor de e-mail indisponível.');
          }

          UI.closeModal();
          UI.toast('Relatório enviado para processamento.');
        } catch (error) {
          UI.toast(
            'O envio de e-mail está disponível quando o servidor local estiver ativo com MailHog.',
            'error'
          );
        }
      });
  }

  window.Email = {
    openEmailModal,
  };
})();
