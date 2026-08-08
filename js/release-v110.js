const ReleaseV110 = (() => {
  let publicSearch = '';
  let publicFilter = 'Todos';

  function escape(value) {
    return UI.escape(value);
  }

  function getCurrentData() {
    return Storage.loadData();
  }

  function getCurrentVersion() {
    const data = getCurrentData();

    const productSelect = document.getElementById('prod-sel');

    const productIndex = productSelect ? Number(productSelect.value || 0) : 0;

    const product = data.products[productIndex];

    if (!product) return null;

    const activeVersion = document.querySelector('#ver-list a.active');

    let versionIndex = 0;

    if (activeVersion) {
      const links = [...document.querySelectorAll('#ver-list a')];

      versionIndex = Math.max(0, links.indexOf(activeVersion));
    }

    return {
      data,
      product,
      version: product.versions[versionIndex],
      productIndex,
      versionIndex,
    };
  }

  function getItems(version) {
    return Array.isArray(version?.items) ? version.items : [];
  }

  function stats(items) {
    return UI.countTypes(items);
  }

  function createDashboard(version) {
    const items = getItems(version);
    const counts = stats(items);

    return `
      <section class="release-summary">

        <div class="release-summary-head">

          <div>
            <span class="release-kicker">
              RELEASE ATUAL
            </span>

            <h1 class="release-title">
              v${escape(version.numero || '—')}
            </h1>

            <span class="release-date">
              ${escape(version.data || '')}
            </span>
          </div>

          <div class="release-count">
            <strong>${items.length}</strong>
            <span>entregas</span>
          </div>

        </div>

        ${
          version.descricao
            ? `
              <p class="release-description">
                ${UI.formatMultiline(version.descricao)}
              </p>
            `
            : ''
        }

        <div class="release-stats">

          <div class="stat-card stat-total">
            <strong>${items.length}</strong>
            <span>Total de entregas</span>
          </div>

          <div class="stat-card stat-implementation">
            <strong>${counts.implementation}</strong>
            <span>Implementações</span>
          </div>

          <div class="stat-card stat-improvement">
            <strong>${counts.improvement}</strong>
            <span>Melhorias</span>
          </div>

          <div class="stat-card stat-fix">
            <strong>${counts.fix}</strong>
            <span>Correções</span>
          </div>

        </div>

      </section>
    `;
  }

  function createToolbar() {
    return `
      <section class="release-toolbar">

        <div class="release-search">
          <label for="release-search">
            Buscar entrega
          </label>

          <input
            id="release-search"
            type="search"
            placeholder="Título, ticket, descrição ou caminho..."
            value="${escape(publicSearch)}"
          />
        </div>

        <div class="release-filters">

          <button
            class="release-filter ${publicFilter === 'Todos' ? 'active' : ''}"
            data-release-filter="Todos"
          >
            Todas
          </button>

          <button
            class="release-filter ${publicFilter === 'Implementação' ? 'active' : ''}"
            data-release-filter="Implementação"
          >
            Implementações
          </button>

          <button
            class="release-filter ${publicFilter === 'Melhoria' ? 'active' : ''}"
            data-release-filter="Melhoria"
          >
            Melhorias
          </button>

          <button
            class="release-filter ${publicFilter === 'Correção' ? 'active' : ''}"
            data-release-filter="Correção"
          >
            Correções
          </button>

        </div>

      </section>
    `;
  }

  function decorateCards() {
    const current = getCurrentVersion();

    if (!current?.version) return;

    const cards = [...document.querySelectorAll('.item-card')];

    const items = getItems(current.version);

    cards.forEach((card, index) => {
      const ticket = card.querySelector('.item-ticket');

      const visibleItems = items.filter((item) => {
        const typeMatch =
          publicFilter === 'Todos' || item.tipo === publicFilter;

        const search = publicSearch.trim().toLowerCase();

        if (!search) {
          return typeMatch;
        }

        const content = [
          item.titulo,
          item.descricao,
          item.ticket,
          item.caminho,
          item.tipo,
        ]
          .join(' ')
          .toLowerCase();

        return typeMatch && content.includes(search);
      });

      const item = items[index];

      if (!item) {
        card.hidden = true;
        return;
      }

      const typeMatch = publicFilter === 'Todos' || item.tipo === publicFilter;

      const search = publicSearch.trim().toLowerCase();

      const content = [
        item.titulo,
        item.descricao,
        item.ticket,
        item.caminho,
        item.tipo,
      ]
        .join(' ')
        .toLowerCase();

      const visible = typeMatch && (!search || content.includes(search));

      card.hidden = !visible;

      if (item.caminho) {
        let path = card.querySelector('.delivery-path');

        if (!path) {
          path = document.createElement('div');

          path.className = 'delivery-path';

          card.querySelector(':scope > div:last-child')?.appendChild(path);
        }

        path.innerHTML = `
          <span class="delivery-path-label">
            Caminho
          </span>

          <span>
            ${escape(item.caminho)}
          </span>
        `;
      }

      if (ticket && item.ticket) {
        ticket.textContent = `#${item.ticket}`;
      }
    });
  }

  function renderEnhancements() {
    const main = document.getElementById('main-content');

    if (!main) return;

    const current = getCurrentVersion();

    if (!current?.version) return;

    const existing = main.querySelector('.release-enhancements');

    if (existing) {
      existing.remove();
    }

    const wrapper = document.createElement('div');

    wrapper.className = 'release-enhancements';

    wrapper.innerHTML = `
      ${createDashboard(current.version)}
      ${createToolbar()}
    `;

    main.prepend(wrapper);

    bindToolbar();

    decorateCards();
  }

  function bindToolbar() {
    const search = document.getElementById('release-search');

    search?.addEventListener('input', (event) => {
      publicSearch = event.target.value;

      decorateCards();
    });

    document.querySelectorAll('[data-release-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        publicFilter = button.dataset.releaseFilter;

        renderEnhancements();
      });
    });
  }

  function csv() {
    const data = getCurrentData();

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
        'Documentação',
      ],
    ];

    data.products.forEach((product) => {
      product.versions.forEach((version) => {
        version.items.forEach((item) => {
          rows.push([
            product.name,
            version.numero,
            version.data,
            item.tipo,
            item.ticket,
            item.titulo,
            item.descricao,
            item.caminho,
            item.link,
          ]);
        });
      });
    });

    return rows.map((row) => row.map(UI.csvEscape).join(',')).join('\r\n');
  }

  function exportCSV() {
    UI.download(
      `release-report-${todayFile()}.csv`,
      '\ufeff' + csv(),
      'text/csv;charset=utf-8'
    );

    UI.toast('CSV exportado.');
  }

  function exportJSON() {
    UI.download(
      `release-backup-${todayFile()}.json`,
      Storage.exportData(),
      'application/json;charset=utf-8'
    );

    UI.toast('JSON exportado.');
  }

  function emailReport() {
    const current = getCurrentVersion();

    if (!current?.version) {
      UI.toast('Nenhuma versão selecionada.');
      return;
    }

    const version = current.version;
    const items = getItems(version);
    const counts = stats(items);

    const subject = `Release Dashboard — v${version.numero}`;

    const body = [
      `Release Dashboard`,
      '',
      `Produto: ${current.product.name}`,
      `Versão: ${version.numero}`,
      `Data: ${version.data}`,
      '',
      `Total de entregas: ${items.length}`,
      `Implementações: ${counts.implementation}`,
      `Melhorias: ${counts.improvement}`,
      `Correções: ${counts.fix}`,
      '',
      'ENTREGAS',
      '',
      ...items.flatMap((item) => [
        `[${item.tipo}] ${item.titulo}`,
        item.ticket ? `Ticket: ${item.ticket}` : '',
        item.caminho ? `Caminho: ${item.caminho}` : '',
        item.descricao || '',
        item.link ? `Documentação: ${item.link}` : '',
        '',
      ]),
    ].join('\n');

    window.location.href =
      `mailto:?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;
  }

  function todayFile() {
    return new Date().toISOString().slice(0, 10);
  }

  function addAdminToolbar() {
    const heading = document.querySelector('#panel-content .page-heading');

    if (!heading) return;

    if (document.getElementById('release-admin-tools')) {
      return;
    }

    const tools = document.createElement('div');

    tools.id = 'release-admin-tools';

    tools.className = 'release-admin-tools';

    tools.innerHTML = `
      <span class="admin-tools-label">
        Relatórios
      </span>

      <button
        type="button"
        class="btn btn-ghost btn-sm"
        id="export-csv-btn"
      >
        CSV
      </button>

      <button
        type="button"
        class="btn btn-ghost btn-sm"
        id="export-json-btn"
      >
        JSON
      </button>

      <button
        type="button"
        class="btn btn-primary btn-sm"
        id="email-report-btn"
      >
        E-mail
      </button>
    `;

    heading.appendChild(tools);

    document
      .getElementById('export-csv-btn')
      ?.addEventListener('click', exportCSV);

    document
      .getElementById('export-json-btn')
      ?.addEventListener('click', exportJSON);

    document
      .getElementById('email-report-btn')
      ?.addEventListener('click', emailReport);
  }

  function addPathFields() {
    const container = document.getElementById('admin-products');

    if (!container) return;

    const data = getCurrentData();

    const productCards = [...container.children].filter((element) =>
      element.classList.contains('section-card')
    );

    productCards.forEach((productCard, productIndex) => {
      const versions = [...productCard.querySelectorAll('.version-admin')];

      versions.forEach((versionCard, versionIndex) => {
        const itemCards = [...versionCard.querySelectorAll('.item-edit-card')];

        itemCards.forEach((itemCard, itemIndex) => {
          if (itemCard.querySelector('[data-release-path]')) {
            return;
          }

          const item =
            data.products[productIndex]?.versions[versionIndex]?.items[
              itemIndex
            ];

          if (!item) return;

          const field = document.createElement('div');

          field.className = 'field-group delivery-path-field';

          field.innerHTML = `
                  <label>
                    Caminho da funcionalidade
                  </label>

                  <input
                    type="text"
                    data-release-path
                    value="${escape(item.caminho || '')}"
                    placeholder="Ex.: Portal > Clientes > Cadastro"
                  />
                `;

          const linkField = itemCard
            .querySelector('input[type="url"]')
            ?.closest('.field-group');

          if (linkField) {
            linkField.before(field);
          } else {
            itemCard.appendChild(field);
          }

          field
            .querySelector('[data-release-path]')
            .addEventListener('change', (event) => {
              const fresh = Storage.loadData();

              const target =
                fresh.products[productIndex]?.versions[versionIndex]?.items[
                  itemIndex
                ];

              if (!target) return;

              target.caminho = event.target.value.trim();

              Storage.saveData(fresh);

              UI.toast('Caminho salvo.');
            });
        });
      });
    });
  }

  function observePublic() {
    const main = document.getElementById('main-content');

    if (!main) return;

    let timer;

    const observer = new MutationObserver(() => {
      clearTimeout(timer);

      timer = setTimeout(renderEnhancements, 30);
    });

    observer.observe(main, {
      childList: true,
    });
  }

  function observeAdmin() {
    const container = document.getElementById('admin-products');

    if (!container) return;

    let timer;

    const observer = new MutationObserver(() => {
      clearTimeout(timer);

      timer = setTimeout(() => {
        addPathFields();
        addAdminToolbar();
      }, 30);
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
    });

    addAdminToolbar();
    addPathFields();
  }

  function initPublic() {
    observePublic();

    setTimeout(renderEnhancements, 50);
  }

  function initAdmin() {
    observeAdmin();
  }

  return {
    initPublic,
    initAdmin,
    exportCSV,
    exportJSON,
    emailReport,
  };
})();
