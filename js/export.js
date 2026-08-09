(function () {
  'use strict';

  function buildReport(product, version) {
    return {
      product,
      version,
      items: version.items || [],
    };
  }

  function downloadCsv(product, version) {
    const rows = [
      [
        'Produto',
        'Versão',
        'Data',
        'Tipo',
        'Ticket',
        'Título',
        'Descrição',
        'Caminho',
      ],
      ...(version.items || []).map(function (item) {
        return [
          product.name,
          version.numero,
          version.data,
          item.tipo,
          item.ticket,
          item.titulo,
          item.descricao,
          item.caminho,
        ];
      }),
    ];

    const csv = rows
      .map(function (row) {
        return row
          .map(function (value) {
            return `"${String(value ?? '').replace(/"/g, '""')}"`;
          })
          .join(';');
      })
      .join('\n');

    const blob = new Blob(['\ufeff' + csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${product.name}-${version.numero}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  function generatePdf(product, version) {
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      UI.toast('Permita pop-ups para gerar o relatório em PDF.', 'error');
      return;
    }

    const rows = (version.items || [])
      .map(function (item) {
        return `
        <tr>
          <td>${UI.escape(item.tipo)}</td>
          <td>${UI.escape(item.ticket)}</td>
          <td>${UI.escape(item.titulo)}</td>
          <td>${UI.escape(item.descricao)}</td>
        </tr>
      `;
      })
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Relatório ${UI.escape(product.name)} ${UI.escape(version.numero)}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #111827;
            padding: 40px;
          }
          h1 { margin-bottom: 4px; }
          .meta { color: #64748b; margin-bottom: 30px; }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #dbe1ea;
            padding: 10px;
            text-align: left;
            vertical-align: top;
          }
          th {
            background: #f1f5f9;
          }
        </style>
      </head>
      <body>
        <h1>${UI.escape(product.name)} — ${UI.escape(version.numero)}</h1>
        <div class="meta">
          Data: ${UI.formatDate(version.data)}
        </div>
        <p>${UI.formatMultiline(version.descricao || '')}</p>

        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Ticket</th>
              <th>Título</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <script>
          window.onload = function () {
            window.print();
          };
        <\/script>
      </body>
      </html>
    `);

    printWindow.document.close();
  }

  window.Export = {
    buildReport,
    downloadCsv,
    generatePdf,
  };
})();
