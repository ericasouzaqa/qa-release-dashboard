(function () {
  'use strict';

  const state = {
    page: 1,
    pageSize: 6,
    product: '',
    version: '',
    search: '',
    date: '',
  };

  function getReleases() {
    const data = Storage.loadData();
    const releases = [];

    data.products.forEach(function (product) {
      product.versions.forEach(function (version) {
        if (version.published !== false) {
          releases.push({
            product,
            version,
          });
        }
      });
    });

    return releases;
  }

  function filteredReleases() {
    const search = state.search.trim().toLowerCase();

    return getReleases().filter(function (entry) {
      const productMatch = !state.product || entry.product.id === state.product;

      const versionMatch = !state.version || entry.version.id === state.version;

      const dateMatch = !state.date || entry.version.data === state.date;

      const searchable = [
        entry.product.name,
        entry.version.numero,
        entry.version.descricao,
        ...entry.version.items.flatMap(function (item) {
          return [
            item.titulo,
            item.descricao,
            item.tipo,
            item.ticket,
            item.caminho,
          ];
        }),
      ]
        .join(' ')
        .toLowerCase();

      const searchMatch = !search || searchable.includes(search);

      return productMatch && versionMatch && dateMatch && searchMatch;
    });
  }

  function initDashboard() {
    const user = Auth.requireAuth();

    if (!user) return;

    updateUserHeader(user);
    populateFilters();

    document
      .getElementById('product-filter')
      .addEventListener('change', function (event) {
        state.product = event.target.value;
        state.version = '';
        state.page = 1;
        populateVersionFilter();
        renderDashboard();
      });

    document
      .getElementById('version-filter')
      .addEventListener('change', function (event) {
        state.version = event.target.value;
        state.page = 1;
        renderDashboard();
      });

    document
      .getElementById('release-search')
      .addEventListener('input', function (event) {
        state.search = event.target.value;
        state.page = 1;
        renderDashboard();
      });

    document
      .getElementById('date-filter')
      .addEventListener('change', function (event) {
        state.date = event.target.value;
        state.page = 1;
        renderDashboard();
      });

    document
      .getElementById('user-avatar')
      .addEventListener('click', function () {
        openProfile(user);
      });

    renderDashboard();
  }

  function updateUserHeader(user) {
    const name = document.getElementById('current-user-name');
    const avatar = document.getElementById('user-avatar');

    name.textContent = user.name;

    const parts = user.name.trim().split(/\s+/);

    avatar.textContent =
      parts.length > 1
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`
        : parts[0][0];

    avatar.textContent = avatar.textContent.toUpperCase();
  }

  function populateFilters() {
    const data = Storage.loadData();
    const select = document.getElementById('product-filter');

    select.innerHTML = `
      <option value="">Todos os produtos</option>
      ${data.products
        .map(function (product) {
          return `<option value="${product.id}">${UI.escape(product.name)}</option>`;
        })
        .join('')}
    `;

    populateVersionFilter();
  }

  function populateVersionFilter() {
    const data = Storage.loadData();
    const select = document.getElementById('version-filter');

    let versions = [];

    data.products.forEach(function (product) {
      if (!state.product || product.id === state.product) {
        product.versions.forEach(function (version) {
          if (version.published !== false) {
            versions.push({
              id: version.id,
              numero: version.numero,
              product: product.name,
            });
          }
        });
      }
    });

    select.innerHTML = `
      <option value="">Todas as versões</option>
      ${versions
        .map(function (version) {
          return `
          <option value="${version.id}">
            ${UI.escape(version.numero)} — ${UI.escape(version.product)}
          </option>
        `;
        })
        .join('')}
    `;

    select.value = state.version;
  }

  function renderDashboard() {
    const root = document.getElementById('release-list');
    const pagination = document.getElementById('pagination');

    const releases = filteredReleases();
    const totalPages = Math.max(1, Math.ceil(releases.length / state.pageSize));

    if (state.page > totalPages) {
      state.page = totalPages;
    }

    const start = (state.page - 1) * state.pageSize;
    const pageItems = releases.slice(start, start + state.pageSize);

    if (!pageItems.length) {
      root.innerHTML = `
        <div class="empty-state card">
          <h2>Nenhuma release encontrada</h2>
          <p>Ajuste os filtros de qualidade para consultar os registros.</p>
        </div>
      `;
      pagination.innerHTML = '';
      return;
    }

    root.innerHTML = pageItems
      .map(function (entry) {
        const product = entry.product;
        const version = entry.version;

        return `
        <article class="release-card card">
          <div class="release-card-header">
            <div>
              <span class="eyebrow">${UI.escape(product.name)}</span>
              <h2>Versão ${UI.escape(version.numero)}</h2>
              <span class="release-date">${UI.formatDate(version.data)}</span>
            </div>

            <span class="status-pill success">Publicada</span>
          </div>

          <p class="release-description">
            ${UI.formatMultiline(version.descricao || '')}
          </p>

          <div class="release-items">
            ${version.items
              .map(function (item) {
                return `
                <div class="release-item">
                  <div>
                    <span class="tag ${typeClass(item.tipo)}">${UI.escape(item.tipo)}</span>
                    ${item.ticket ? `<code>${UI.escape(item.ticket)}</code>` : ''}
                  </div>
                  <strong>${UI.escape(item.titulo)}</strong>
                  <p>${UI.escape(item.descricao)}</p>
                  ${item.caminho ? `<small>${UI.escape(item.caminho)}</small>` : ''}
                </div>
              `;
              })
              .join('')}
          </div>

          <div class="release-actions">
            <button
              class="btn btn-secondary"
              data-csv
              data-product="${UI.escape(product.id)}"
              data-version="${UI.escape(version.id)}"
            >
              Gerar CSV
            </button>

            <button
              class="btn btn-secondary"
              data-pdf
              data-product="${UI.escape(product.id)}"
              data-version="${UI.escape(version.id)}"
            >
              Gerar PDF
            </button>

            <button
              class="btn btn-primary"
              data-email
              data-product="${UI.escape(product.id)}"
              data-version="${UI.escape(version.id)}"
            >
              Enviar por e-mail
            </button>
          </div>
        </article>
      `;
      })
      .join('');

    root.querySelectorAll('[data-csv]').forEach(function (button) {
      button.addEventListener('click', function () {
        const entry = findRelease(
          button.dataset.product,
          button.dataset.version
        );

        if (entry) {
          Export.downloadCsv(entry.product, entry.version);
        }
      });
    });

    root.querySelectorAll('[data-pdf]').forEach(function (button) {
      button.addEventListener('click', function () {
        const entry = findRelease(
          button.dataset.product,
          button.dataset.version
        );

        if (entry) {
          Export.generatePdf(entry.product, entry.version);
        }
      });
    });

    root.querySelectorAll('[data-email]').forEach(function (button) {
      button.addEventListener('click', function () {
        const entry = findRelease(
          button.dataset.product,
          button.dataset.version
        );

        if (entry) {
          Email.openEmailModal(entry.product, entry.version);
        }
      });
    });

    renderPagination(pagination, totalPages);
  }

  function renderPagination(root, totalPages) {
    if (totalPages <= 1) {
      root.innerHTML = '';
      return;
    }

    root.innerHTML = `
      <button class="btn btn-secondary btn-sm" data-page-prev ${state.page === 1 ? 'disabled' : ''}>
        Anterior
      </button>

      <span>Página ${state.page} de ${totalPages}</span>

      <button class="btn btn-secondary btn-sm" data-page-next ${state.page === totalPages ? 'disabled' : ''}>
        Próxima
      </button>
    `;

    root
      .querySelector('[data-page-prev]')
      .addEventListener('click', function () {
        if (state.page > 1) {
          state.page--;
          renderDashboard();
        }
      });

    root
      .querySelector('[data-page-next]')
      .addEventListener('click', function () {
        if (state.page < totalPages) {
          state.page++;
          renderDashboard();
        }
      });
  }

  function findRelease(productId, versionId) {
    return getReleases().find(function (entry) {
      return entry.product.id === productId && entry.version.id === versionId;
    });
  }

  function typeClass(type) {
    if (type === 'Implementação') return 'tag-impl';
    if (type === 'Melhoria') return 'tag-melho';
    return 'tag-corr';
  }

  function openProfile(user) {
    UI.openModal(
      `
      <div class="profile-modal">
        <div class="profile-large-avatar">
          ${UI.escape(
            user.name
              .split(/\s+/)
              .map(function (part) {
                return part[0];
              })
              .slice(0, 2)
              .join('')
              .toUpperCase()
          )}
        </div>

        <h3>${UI.escape(user.name)}</h3>
        <p>${UI.escape(user.email || '')}</p>

        <div class="modal-inline-actions">
          ${
            user.role === 'ADMIN'
              ? '<a class="btn btn-primary" href="admin.html">Administração</a>'
              : ''
          }

          <button class="btn btn-secondary" id="profile-logout">
            Sair
          </button>
        </div>
      </div>
    `,
      {
        title: 'Perfil',
      }
    );

    document
      .getElementById('profile-logout')
      .addEventListener('click', Auth.logout);
  }

  function initAdmin() {
    const user = Auth.requireAdmin();

    if (!user) return;

    const name = document.getElementById('admin-user-name');
    const avatar = document.getElementById('admin-avatar');

    name.textContent = user.name;

    const initials = user.name
      .split(/\s+/)
      .map(function (part) {
        return part[0];
      })
      .slice(0, 2)
      .join('')
      .toUpperCase();

    avatar.textContent = initials;

    document
      .getElementById('admin-logout')
      .addEventListener('click', Auth.logout);

    document.querySelectorAll('[data-section]').forEach(function (button) {
      button.addEventListener('click', function () {
        document.querySelectorAll('[data-section]').forEach(function (item) {
          item.classList.remove('active');
        });

        button.classList.add('active');

        renderAdminSection(button.dataset.section);
      });
    });

    renderAdminSection('releases');
  }

  function renderAdminSection(section) {
    const content = document.getElementById('admin-content');

    if (section === 'releases') {
      renderAdminReleases(content);
    } else if (section === 'users') {
      renderAdminUsers(content);
    } else {
      renderAdminGroups(content);
    }
  }

  function renderAdminReleases(content) {
    const data = Storage.loadData();

    content.innerHTML = `
      <div class="admin-heading">
        <div>
          <span class="eyebrow">ADMINISTRAÇÃO DE QA</span>
          <h1>Produtos e releases</h1>
          <p>Cadastre o produto e, dentro dele, gerencie versões e entregas.</p>
        </div>

        <button class="btn btn-primary" id="new-product">
          Novo produto
        </button>
      </div>

      <div class="admin-filters card">
        <div class="field-group">
          <label>Produto</label>
          <select id="admin-product-filter">
            <option value="">Todos</option>
            ${data.products
              .map(function (product) {
                return `<option value="${product.id}">${UI.escape(product.name)}</option>`;
              })
              .join('')}
          </select>
        </div>

        <div class="field-group">
          <label>Versão</label>
          <input id="admin-version-filter" placeholder="Ex.: 1.2.0">
        </div>

        <div class="field-group field-grow">
          <label>Card, título ou descrição</label>
          <input id="admin-text-filter" placeholder="Pesquisar entregas">
        </div>
      </div>

      <div id="admin-product-list">
        ${data.products.map(renderAdminProduct).join('')}
      </div>
    `;

    document
      .getElementById('new-product')
      .addEventListener('click', function () {
        openProductModal();
      });

    function rerender() {
      const productFilter = document.getElementById(
        'admin-product-filter'
      ).value;
      const versionFilter = document
        .getElementById('admin-version-filter')
        .value.toLowerCase();
      const textFilter = document
        .getElementById('admin-text-filter')
        .value.toLowerCase();

      const list = document.getElementById('admin-product-list');

      list.innerHTML = data.products
        .filter(function (product) {
          if (productFilter && product.id !== productFilter) return false;

          return product.versions.some(function (version) {
            const versionMatch =
              !versionFilter ||
              version.numero.toLowerCase().includes(versionFilter);

            const text = [
              product.name,
              version.descricao,
              ...version.items.flatMap(function (item) {
                return [item.ticket, item.titulo, item.descricao, item.tipo];
              }),
            ]
              .join(' ')
              .toLowerCase();

            return versionMatch && (!textFilter || text.includes(textFilter));
          });
        })
        .map(renderAdminProduct)
        .join('');

      bindAdminReleaseActions(content);
    }

    [
      'admin-product-filter',
      'admin-version-filter',
      'admin-text-filter',
    ].forEach(function (id) {
      document.getElementById(id).addEventListener('input', rerender);
      document.getElementById(id).addEventListener('change', rerender);
    });

    bindAdminReleaseActions(content);
  }

  function renderAdminProduct(product) {
    return `
      <section class="admin-product card">
        <div class="admin-product-header">
          <div>
            <span class="eyebrow">PRODUTO</span>
            <h2>${UI.escape(product.name)}</h2>
            <span>${product.versions.length} versões</span>
          </div>

          <div class="action-row">
            <button class="btn btn-secondary btn-sm" data-edit-product="${product.id}">
              Editar
            </button>

            <button class="btn btn-danger btn-sm" data-delete-product="${product.id}">
              Excluir
            </button>

            <button class="btn btn-primary btn-sm" data-new-version="${product.id}">
              Nova versão
            </button>
          </div>
        </div>

        <div class="version-list">
          ${product.versions
            .map(function (version) {
              return `
              <article class="version-admin">
                <div class="version-admin-header">
                  <div>
                    <strong>v${UI.escape(version.numero)}</strong>
                    <span>${UI.formatDate(version.data)}</span>
                  </div>

                  <label class="toggle">
                    <input
                      type="checkbox"
                      data-toggle-version="${product.id}"
                      data-version="${version.id}"
                      ${version.published !== false ? 'checked' : ''}
                    >
                    <span></span>
                    <small>${version.published !== false ? 'Publicada' : 'Desativada'}</small>
                  </label>
                </div>

                <p>${UI.formatMultiline(version.descricao || '')}</p>

                <div class="version-items-admin">
                  ${version.items
                    .map(function (item) {
                      return `
                      <div class="admin-item">
                        <div>
                          <span class="tag ${typeClass(item.tipo)}">${UI.escape(item.tipo)}</span>
                          ${item.ticket ? `<code>${UI.escape(item.ticket)}</code>` : ''}
                          <strong>${UI.escape(item.titulo)}</strong>
                          <p>${UI.escape(item.descricao)}</p>
                        </div>

                        <div class="action-row">
                          <button
                            class="btn btn-secondary btn-sm"
                            data-edit-item="${product.id}"
                            data-version="${version.id}"
                            data-item="${item.id}"
                          >
                            Editar
                          </button>

                          <button
                            class="btn btn-danger btn-sm"
                            data-delete-item="${product.id}"
                            data-version="${version.id}"
                            data-item="${item.id}"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    `;
                    })
                    .join('')}
                </div>

                <div class="action-row">
                  <button
                    class="btn btn-secondary btn-sm"
                    data-edit-version="${product.id}"
                    data-version="${version.id}"
                  >
                    Editar versão
                  </button>

                  <button
                    class="btn btn-primary btn-sm"
                    data-new-item="${product.id}"
                    data-version="${version.id}"
                  >
                    Adicionar entrega
                  </button>

                  <button
                    class="btn btn-danger btn-sm"
                    data-delete-version="${product.id}"
                    data-version="${version.id}"
                  >
                    Excluir versão
                  </button>
                </div>
              </article>
            `;
            })
            .join('')}
        </div>
      </section>
    `;
  }

  function bindAdminReleaseActions(content) {
    content.querySelectorAll('[data-edit-product]').forEach(function (button) {
      button.addEventListener('click', function () {
        openProductModal(button.dataset.editProduct);
      });
    });

    content
      .querySelectorAll('[data-delete-product]')
      .forEach(function (button) {
        button.addEventListener('click', function () {
          deleteProduct(button.dataset.deleteProduct);
        });
      });

    content.querySelectorAll('[data-new-version]').forEach(function (button) {
      button.addEventListener('click', function () {
        openVersionModal(button.dataset.newVersion);
      });
    });

    content.querySelectorAll('[data-edit-version]').forEach(function (button) {
      button.addEventListener('click', function () {
        openVersionModal(button.dataset.editVersion, button.dataset.version);
      });
    });

    content
      .querySelectorAll('[data-delete-version]')
      .forEach(function (button) {
        button.addEventListener('click', function () {
          deleteVersion(button.dataset.deleteVersion, button.dataset.version);
        });
      });

    content.querySelectorAll('[data-new-item]').forEach(function (button) {
      button.addEventListener('click', function () {
        openItemModal(button.dataset.newItem, button.dataset.version);
      });
    });

    content.querySelectorAll('[data-edit-item]').forEach(function (button) {
      button.addEventListener('click', function () {
        openItemModal(
          button.dataset.editItem,
          button.dataset.version,
          button.dataset.item
        );
      });
    });

    content.querySelectorAll('[data-delete-item]').forEach(function (button) {
      button.addEventListener('click', function () {
        deleteItem(
          button.dataset.deleteItem,
          button.dataset.version,
          button.dataset.item
        );
      });
    });

    content.querySelectorAll('[data-toggle-version]').forEach(function (input) {
      input.addEventListener('change', function () {
        toggleVersion(
          input.dataset.toggleVersion,
          input.dataset.version,
          input.checked
        );
      });
    });
  }

  function openProductModal(productId) {
    const data = Storage.loadData();
    const product = productId
      ? data.products.find(function (item) {
          return item.id === productId;
        })
      : null;

    UI.openModal(
      `
      <form id="product-form">
        <div class="field-group">
          <label for="product-name">Nome do produto / menu do sistema</label>
          <input id="product-name" required value="${UI.escape(product?.name || '')}">
        </div>

        <div class="modal-inline-actions">
          <button type="button" class="btn btn-secondary" data-modal-close>Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar produto</button>
        </div>
      </form>
    `,
      {
        title: product ? 'Editar produto' : 'Novo produto',
      }
    );

    document
      .getElementById('product-form')
      .addEventListener('submit', function (event) {
        event.preventDefault();

        const fresh = Storage.loadData();
        const name = document.getElementById('product-name').value.trim();

        if (!name) return;

        if (product) {
          const target = fresh.products.find(function (item) {
            return item.id === product.id;
          });

          target.name = name;
        } else {
          fresh.products.push({
            id: crypto.randomUUID(),
            name,
            active: true,
            versions: [],
          });
        }

        Storage.saveData(fresh);
        UI.closeModal();
        renderAdminSection('releases');
        UI.toast('Produto salvo.');
      });
  }

  function openVersionModal(productId, versionId) {
    const data = Storage.loadData();
    const product = data.products.find(function (item) {
      return item.id === productId;
    });

    if (!product) return;

    const version = versionId
      ? product.versions.find(function (item) {
          return item.id === versionId;
        })
      : null;

    UI.openModal(
      `
      <form id="version-form">

        <div class="form-grid-2">
          <div class="field-group">
            <label for="version-number">Versão</label>
            <input id="version-number" required placeholder="1.2.0" value="${UI.escape(version?.numero || '')}">
          </div>

          <div class="field-group">
            <label for="version-date">Data</label>
            <input id="version-date" type="date" required value="${UI.escape(version?.data || '')}">
          </div>
        </div>

        <div class="field-group">
          <label for="version-description">Descrição da release</label>
          <textarea id="version-description" rows="5">${UI.escape(version?.descricao || '')}</textarea>
        </div>

        <div class="modal-inline-actions">
          <button type="button" class="btn btn-secondary" data-modal-close>Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar versão</button>
        </div>
      </form>
    `,
      {
        title: version ? 'Editar versão' : 'Nova versão',
        size: 'lg',
      }
    );

    document
      .getElementById('version-form')
      .addEventListener('submit', function (event) {
        event.preventDefault();

        const fresh = Storage.loadData();
        const target = fresh.products.find(function (item) {
          return item.id === productId;
        });

        const value = {
          id: version?.id || crypto.randomUUID(),
          numero: document.getElementById('version-number').value.trim(),
          data: document.getElementById('version-date').value,
          descricao: document
            .getElementById('version-description')
            .value.trim(),
          published: version?.published !== false,
          items: version?.items || [],
        };

        if (!value.numero || !value.data) {
          UI.toast('Informe versão e data.', 'error');
          return;
        }

        if (version) {
          const index = target.versions.findIndex(function (item) {
            return item.id === version.id;
          });

          target.versions[index] = value;
        } else {
          target.versions.unshift(value);
        }

        Storage.saveData(fresh);
        UI.closeModal();
        renderAdminSection('releases');
        UI.toast('Versão salva.');
      });
  }

  function openItemModal(productId, versionId, itemId) {
    const data = Storage.loadData();
    const product = data.products.find(function (item) {
      return item.id === productId;
    });

    const version = product?.versions.find(function (item) {
      return item.id === versionId;
    });

    const item = version?.items.find(function (entry) {
      return entry.id === itemId;
    });

    UI.openModal(
      `
      <form id="item-form">

        <div class="form-grid-2">
          <div class="field-group">
            <label for="item-ticket">Ticket</label>
            <input id="item-ticket" value="${UI.escape(item?.ticket || '')}" placeholder="QA-123">
          </div>

          <div class="field-group">
            <label for="item-type">Tipo</label>
            <select id="item-type">
              ${['Implementação', 'Melhoria', 'Correção']
                .map(function (type) {
                  return `
                  <option value="${type}" ${item?.tipo === type ? 'selected' : ''}>
                    ${type}
                  </option>
                `;
                })
                .join('')}
            </select>
          </div>
        </div>

        <div class="field-group">
          <label for="item-title">Título</label>
          <input id="item-title" required value="${UI.escape(item?.titulo || '')}">
        </div>

        <div class="field-group">
          <label for="item-description">Descrição</label>
          <textarea id="item-description" rows="5">${UI.escape(item?.descricao || '')}</textarea>
        </div>

        <div class="field-group">
          <label for="item-path">Caminho da funcionalidade</label>
          <input id="item-path" value="${UI.escape(item?.caminho || '')}" placeholder="Sistema > Clientes > Cadastro">
        </div>

        <div class="field-group">
          <label for="item-link">Documentação</label>
          <input id="item-link" type="url" value="${UI.escape(item?.link || '')}">
        </div>

        <div class="modal-inline-actions">
          <button type="button" class="btn btn-secondary" data-modal-close>Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar entrega</button>
        </div>
      </form>
    `,
      {
        title: item ? 'Editar entrega de QA' : 'Nova entrega de QA',
        size: 'lg',
      }
    );

    document
      .getElementById('item-form')
      .addEventListener('submit', function (event) {
        event.preventDefault();

        const fresh = Storage.loadData();
        const freshProduct = fresh.products.find(function (entry) {
          return entry.id === productId;
        });

        const freshVersion = freshProduct?.versions.find(function (entry) {
          return entry.id === versionId;
        });

        if (!freshVersion) return;

        const value = {
          id: item?.id || crypto.randomUUID(),
          ticket: document.getElementById('item-ticket').value.trim(),
          tipo: document.getElementById('item-type').value,
          titulo: document.getElementById('item-title').value.trim(),
          descricao: document.getElementById('item-description').value.trim(),
          caminho: document.getElementById('item-path').value.trim(),
          link: document.getElementById('item-link').value.trim(),
        };

        if (!value.titulo) {
          UI.toast('Informe o título da entrega.', 'error');
          return;
        }

        if (item) {
          const index = freshVersion.items.findIndex(function (entry) {
            return entry.id === item.id;
          });

          freshVersion.items[index] = value;
        } else {
          freshVersion.items.push(value);
        }

        Storage.saveData(fresh);
        UI.closeModal();
        renderAdminSection('releases');
        UI.toast('Entrega salva.');
      });
  }

  function toggleVersion(productId, versionId, published) {
    const data = Storage.loadData();

    const product = data.products.find(function (item) {
      return item.id === productId;
    });

    const version = product?.versions.find(function (item) {
      return item.id === versionId;
    });

    if (!version) return;

    version.published = published;

    Storage.saveData(data);

    UI.toast(published ? 'Versão publicada.' : 'Versão desativada.');

    renderAdminSection('releases');
  }

  function deleteProduct(productId) {
    const data = Storage.loadData();

    const index = data.products.findIndex(function (item) {
      return item.id === productId;
    });

    if (index < 0) return;

    const product = data.products[index];

    if (
      !UI.confirmAction(
        `Excluir o produto "${product.name}" e todas as versões?`
      )
    ) {
      return;
    }

    data.products.splice(index, 1);
    Storage.saveData(data);

    renderAdminSection('releases');
    UI.toast('Produto excluído.');
  }

  function deleteVersion(productId, versionId) {
    const data = Storage.loadData();

    const product = data.products.find(function (item) {
      return item.id === productId;
    });

    const index = product?.versions.findIndex(function (item) {
      return item.id === versionId;
    });

    if (!product || index < 0) return;

    if (
      !UI.confirmAction(`Excluir a versão ${product.versions[index].numero}?`)
    ) {
      return;
    }

    product.versions.splice(index, 1);
    Storage.saveData(data);

    renderAdminSection('releases');
    UI.toast('Versão excluída.');
  }

  function deleteItem(productId, versionId, itemId) {
    const data = Storage.loadData();

    const product = data.products.find(function (item) {
      return item.id === productId;
    });

    const version = product?.versions.find(function (item) {
      return item.id === versionId;
    });

    const index = version?.items.findIndex(function (item) {
      return item.id === itemId;
    });

    if (!version || index < 0) return;

    if (
      !UI.confirmAction(`Excluir a entrega "${version.items[index].titulo}"?`)
    ) {
      return;
    }

    version.items.splice(index, 1);

    Storage.saveData(data);

    renderAdminSection('releases');
    UI.toast('Entrega excluída.');
  }

  function renderAdminUsers(content) {
    const data = Storage.loadData();

    content.innerHTML = `
      <div class="admin-heading">
        <div>
          <span class="eyebrow">ADMINISTRAÇÃO DE QA</span>
          <h1>Usuários</h1>
          <p>Controle de acesso ao ambiente de demonstração.</p>
        </div>

        <button class="btn btn-primary" id="new-user">Novo usuário</button>
      </div>

      <div class="admin-table-wrap card">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Usuário</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            ${data.users
              .map(function (user) {
                return `
                <tr>
                  <td>${UI.escape(user.name)}</td>
                  <td>${UI.escape(user.username)}</td>
                  <td>${UI.escape(user.email)}</td>
                  <td>${user.role === 'ADMIN' ? 'Administrador' : 'Usuário de QA'}</td>
                  <td>
                    <span class="status-pill ${user.active !== false ? 'success' : 'danger'}">
                      ${user.active !== false ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td class="table-actions">
                    <button class="btn btn-secondary btn-sm" data-edit-user="${user.id}">Editar</button>
                    <button class="btn btn-secondary btn-sm" data-toggle-user="${user.id}">
                      ${user.active !== false ? 'Inativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              `;
              })
              .join('')}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('new-user').addEventListener('click', function () {
      openUserModal();
    });

    content.querySelectorAll('[data-edit-user]').forEach(function (button) {
      button.addEventListener('click', function () {
        openUserModal(button.dataset.editUser);
      });
    });

    content.querySelectorAll('[data-toggle-user]').forEach(function (button) {
      button.addEventListener('click', function () {
        toggleUser(button.dataset.toggleUser);
      });
    });
  }

  function openUserModal(userId) {
    const data = Storage.loadData();

    const user = userId
      ? data.users.find(function (item) {
          return item.id === userId;
        })
      : null;

    UI.openModal(
      `
      <form id="user-form">

        <div class="field-group">
          <label for="user-name">Nome</label>
          <input id="user-name" required value="${UI.escape(user?.name || '')}">
        </div>

        <div class="form-grid-2">
          <div class="field-group">
            <label for="user-username">Usuário</label>
            <input id="user-username" required ${user ? 'disabled' : ''} value="${UI.escape(user?.username || '')}">
          </div>

          <div class="field-group">
            <label for="user-role">Perfil</label>
            <select id="user-role">
              <option value="USER" ${user?.role !== 'ADMIN' ? 'selected' : ''}>Usuário de QA</option>
              <option value="ADMIN" ${user?.role === 'ADMIN' ? 'selected' : ''}>Administrador</option>
            </select>
          </div>
        </div>

        <div class="field-group">
          <label for="user-email">E-mail</label>
          <input id="user-email" type="email" value="${UI.escape(user?.email || '')}">
        </div>

        <div class="field-group">
          <label for="user-password">Senha</label>
          <input id="user-password" type="password" minlength="8" ${user ? '' : 'required'}>
          ${user ? '<small>Preencha apenas se quiser alterar a senha.</small>' : ''}
        </div>

        <div class="modal-inline-actions">
          <button type="button" class="btn btn-secondary" data-modal-close>Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar usuário</button>
        </div>
      </form>
    `,
      {
        title: user ? 'Editar usuário' : 'Novo usuário',
      }
    );

    document
      .getElementById('user-form')
      .addEventListener('submit', function (event) {
        event.preventDefault();

        const fresh = Storage.loadData();

        const name = document.getElementById('user-name').value.trim();
        const email = document.getElementById('user-email').value.trim();
        const password = document.getElementById('user-password').value;

        if (!name) {
          UI.toast('Informe o nome.', 'error');
          return;
        }

        if (user) {
          const target = fresh.users.find(function (item) {
            return item.id === user.id;
          });

          target.name = name;
          target.email = email;
          target.role = document.getElementById('user-role').value;

          if (password) {
            target.password = password;
          }
        } else {
          const username = document
            .getElementById('user-username')
            .value.trim();

          if (
            fresh.users.some(function (item) {
              return item.username.toLowerCase() === username.toLowerCase();
            })
          ) {
            UI.toast('Usuário já cadastrado.', 'error');
            return;
          }

          fresh.users.push({
            id: crypto.randomUUID(),
            name,
            username,
            email,
            role: document.getElementById('user-role').value,
            active: true,
            firstAccess: false,
            password,
          });
        }

        Storage.saveData(fresh);
        UI.closeModal();
        renderAdminSection('users');
        UI.toast('Usuário salvo.');
      });
  }

  function toggleUser(userId) {
    const data = Storage.loadData();

    const user = data.users.find(function (item) {
      return item.id === userId;
    });

    if (!user) return;

    const current = Auth.getCurrentUser();

    if (current?.id === user.id) {
      UI.toast('Você não pode inativar seu próprio usuário.', 'error');
      return;
    }

    user.active = user.active === false;

    Storage.saveData(data);
    renderAdminSection('users');

    UI.toast(user.active ? 'Usuário ativado.' : 'Usuário inativado.');
  }

  function renderAdminGroups(content) {
    const data = Storage.loadData();

    content.innerHTML = `
      <div class="admin-heading">
        <div>
          <span class="eyebrow">ADMINISTRAÇÃO DE QA</span>
          <h1>Grupos de e-mail</h1>
          <p>Cadastre grupos com até 25 destinatários.</p>
        </div>

        <button class="btn btn-primary" id="new-group">Novo grupo</button>
      </div>

      <div class="group-grid">
        ${data.emailGroups
          .map(function (group) {
            return `
            <article class="group-card card">
              <div class="group-card-head">
                <div>
                  <h2>${UI.escape(group.name)}</h2>
                  <span>${group.recipients.length}/25 destinatários</span>
                </div>

                <span class="status-pill ${group.active !== false ? 'success' : 'danger'}">
                  ${group.active !== false ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <div class="recipient-list">
                ${group.recipients
                  .map(function (recipient) {
                    return `
                    <div class="recipient-row">
                      <div>
                        <strong>${UI.escape(recipient.name)}</strong>
                        <small>${UI.escape(recipient.role)}</small>
                      </div>
                      <span>${UI.escape(recipient.email)}</span>
                    </div>
                  `;
                  })
                  .join('')}
              </div>

              <div class="action-row">
                <button class="btn btn-secondary btn-sm" data-edit-group="${group.id}">
                  Editar
                </button>

                <button class="btn btn-secondary btn-sm" data-toggle-group="${group.id}">
                  ${group.active !== false ? 'Inativar' : 'Ativar'}
                </button>

                <button class="btn btn-danger btn-sm" data-delete-group="${group.id}">
                  Excluir
                </button>
              </div>
            </article>
          `;
          })
          .join('')}
      </div>
    `;

    document.getElementById('new-group').addEventListener('click', function () {
      openGroupModal();
    });

    content.querySelectorAll('[data-edit-group]').forEach(function (button) {
      button.addEventListener('click', function () {
        openGroupModal(button.dataset.editGroup);
      });
    });

    content.querySelectorAll('[data-toggle-group]').forEach(function (button) {
      button.addEventListener('click', function () {
        toggleGroup(button.dataset.toggleGroup);
      });
    });

    content.querySelectorAll('[data-delete-group]').forEach(function (button) {
      button.addEventListener('click', function () {
        deleteGroup(button.dataset.deleteGroup);
      });
    });
  }

  function openGroupModal(groupId) {
    const data = Storage.loadData();

    const group = groupId
      ? data.emailGroups.find(function (item) {
          return item.id === groupId;
        })
      : null;

    let recipients = group
      ? group.recipients.map(function (recipient) {
          return { ...recipient };
        })
      : [];

    UI.openModal(
      `
      <form id="group-form">

        <div class="field-group">
          <label for="group-name">Nome do grupo</label>
          <input id="group-name" required value="${UI.escape(group?.name || '')}" placeholder="Ex.: QA">
        </div>

        <div class="recipient-editor">
          <div class="recipient-editor-head">
            <strong>Destinatários</strong>
            <span id="recipient-count">${recipients.length}/25</span>
          </div>

          <div id="recipient-fields"></div>

          <button type="button" class="btn btn-secondary btn-sm" id="add-recipient">
            Adicionar destinatário
          </button>
        </div>

        <div class="modal-inline-actions">
          <button type="button" class="btn btn-secondary" data-modal-close>Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar grupo</button>
        </div>
      </form>
    `,
      {
        title: group ? 'Editar grupo' : 'Novo grupo',
        size: 'lg',
      }
    );

    const fields = document.getElementById('recipient-fields');

    function renderRecipients() {
      fields.innerHTML = recipients
        .map(function (recipient, index) {
          return `
          <div class="recipient-form-row">
            <div class="field-group">
              <label>Nome</label>
              <input data-name required value="${UI.escape(recipient.name)}">
            </div>

            <div class="field-group">
              <label>Cargo</label>
              <input data-role required value="${UI.escape(recipient.role)}">
            </div>

            <div class="field-group">
              <label>E-mail</label>
              <input data-email type="email" required value="${UI.escape(recipient.email)}">
            </div>

            <button type="button" class="btn btn-danger btn-sm" data-remove="${index}">
              Remover
            </button>
          </div>
        `;
        })
        .join('');

      document.getElementById('recipient-count').textContent =
        `${recipients.length}/25`;

      fields.querySelectorAll('[data-remove]').forEach(function (button) {
        button.addEventListener('click', function () {
          recipients.splice(Number(button.dataset.remove), 1);
          renderRecipients();
        });
      });
    }

    document
      .getElementById('add-recipient')
      .addEventListener('click', function () {
        if (recipients.length >= 25) {
          UI.toast('O limite de 25 destinatários foi atingido.', 'error');
          return;
        }

        recipients.push({
          id: crypto.randomUUID(),
          name: '',
          role: '',
          email: '',
        });

        renderRecipients();
      });

    document
      .getElementById('group-form')
      .addEventListener('submit', function (event) {
        event.preventDefault();

        if (recipients.length > 25) {
          UI.toast('Um grupo pode ter no máximo 25 destinatários.', 'error');
          return;
        }

        const rows = [...fields.querySelectorAll('.recipient-form-row')];

        const finalRecipients = rows.map(function (row, index) {
          return {
            id: recipients[index]?.id || crypto.randomUUID(),
            name: row.querySelector('[data-name]').value.trim(),
            role: row.querySelector('[data-role]').value.trim(),
            email: row.querySelector('[data-email]').value.trim().toLowerCase(),
          };
        });

        const emails = finalRecipients.map(function (recipient) {
          return recipient.email;
        });

        if (new Set(emails).size !== emails.length) {
          UI.toast('Não é permitido repetir e-mails no mesmo grupo.', 'error');
          return;
        }

        for (const recipient of finalRecipients) {
          if (!recipient.name || !recipient.role) {
            UI.toast(
              'Preencha nome e cargo de todos os destinatários.',
              'error'
            );
            return;
          }

          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient.email)) {
            UI.toast(`E-mail inválido: ${recipient.email}`, 'error');
            return;
          }
        }

        const fresh = Storage.loadData();

        const value = {
          id: group?.id || crypto.randomUUID(),
          name: document.getElementById('group-name').value.trim(),
          active: group?.active !== false,
          recipients: finalRecipients,
        };

        if (!value.name) {
          UI.toast('Informe o nome do grupo.', 'error');
          return;
        }

        if (group) {
          const index = fresh.emailGroups.findIndex(function (item) {
            return item.id === group.id;
          });

          fresh.emailGroups[index] = value;
        } else {
          fresh.emailGroups.push(value);
        }

        Storage.saveData(fresh);
        UI.closeModal();
        renderAdminSection('groups');
        UI.toast('Grupo salvo.');
      });

    renderRecipients();
  }

  function toggleGroup(groupId) {
    const data = Storage.loadData();

    const group = data.emailGroups.find(function (item) {
      return item.id === groupId;
    });

    if (!group) return;

    group.active = group.active === false;

    Storage.saveData(data);
    renderAdminSection('groups');

    UI.toast(group.active ? 'Grupo ativado.' : 'Grupo inativado.');
  }

  function deleteGroup(groupId) {
    const data = Storage.loadData();

    const index = data.emailGroups.findIndex(function (item) {
      return item.id === groupId;
    });

    if (index < 0) return;

    if (
      !UI.confirmAction(`Excluir o grupo "${data.emailGroups[index].name}"?`)
    ) {
      return;
    }

    data.emailGroups.splice(index, 1);

    Storage.saveData(data);
    renderAdminSection('groups');

    UI.toast('Grupo excluído.');
  }

  window.Release = {
    initDashboard,
    initAdmin,
  };
})();
