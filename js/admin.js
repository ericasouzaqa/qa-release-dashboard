'use strict';

window.Admin = (() => {
  const state = {
    section: 'releases',
    releasePage: 1,
    userPage: 1,
    groupPage: 1,
  };

  const PAGE_SIZE = 6;

  function init() {
    const user = Auth.requireAuth([Auth.ROLES.ADMIN]);

    if (!user) {
      return;
    }

    bindNavigation();

    document
      .getElementById('admin-logout')
      ?.addEventListener('click', () => Auth.logout());

    document
      .getElementById('admin-dashboard')
      ?.addEventListener('click', () => window.location.replace('index.html'));

    document
      .getElementById('admin-profile')
      ?.addEventListener('click', openProfile);

    render();
  }

  function bindNavigation() {
    document.querySelectorAll('[data-admin-section]').forEach((button) => {
      button.addEventListener('click', () => {
        state.section = button.dataset.adminSection;

        render();
      });
    });
  }

  function render() {
    document.querySelectorAll('[data-admin-section]').forEach((button) => {
      button.classList.toggle(
        'active',
        button.dataset.adminSection === state.section
      );
    });

    const content = document.getElementById('admin-content');

    if (!content) {
      return;
    }

    if (state.section === 'releases') {
      renderReleases(content);

      return;
    }

    if (state.section === 'users') {
      renderUsers(content);

      return;
    }

    if (state.section === 'groups') {
      renderGroups(content);
    }
  }

  function renderReleases(content) {
    const data = Storage.loadData();

    content.innerHTML = `
      <div class="admin-page-heading">

        <div>
          <div class="eyebrow">
            ADMINISTRAÇÃO
          </div>

          <h1>
            Releases
          </h1>

          <p>
            Gerencie produtos, versões e entregas.
          </p>
        </div>

        <button
          class="btn btn-primary"
          id="new-product"
        >
          Novo produto
        </button>

      </div>

      ${
        data.products.length
          ? data.products
              .map((product, productIndex) =>
                renderProduct(product, productIndex)
              )
              .join('')
          : `
              <div class="empty-state">
                <h2>
                  Nenhum produto cadastrado
                </h2>

                <p>
                  Comece criando o primeiro produto.
                </p>
              </div>
            `
      }
    `;

    bindReleaseActions(content);
  }

  function bindReleaseActions(content) {
    document
      .getElementById('new-product')
      ?.addEventListener('click', () => openProductModal());

    content.querySelectorAll('[data-edit-product]').forEach((button) => {
      button.addEventListener('click', () =>
        openProductModal(Number(button.dataset.editProduct))
      );
    });

    content.querySelectorAll('[data-delete-product]').forEach((button) => {
      button.addEventListener('click', () =>
        deleteProduct(Number(button.dataset.deleteProduct))
      );
    });

    content.querySelectorAll('[data-new-version]').forEach((button) => {
      button.addEventListener('click', () =>
        openVersionModal(Number(button.dataset.product))
      );
    });

    content.querySelectorAll('[data-edit-version]').forEach((button) => {
      button.addEventListener('click', () =>
        openVersionModal(
          Number(button.dataset.product),
          Number(button.dataset.editVersion)
        )
      );
    });

    content.querySelectorAll('[data-toggle-version]').forEach((button) => {
      button.addEventListener('click', () =>
        toggleVersion(
          Number(button.dataset.product),
          Number(button.dataset.toggleVersion)
        )
      );
    });

    content.querySelectorAll('[data-delete-version]').forEach((button) => {
      button.addEventListener('click', () =>
        deleteVersion(
          Number(button.dataset.product),
          Number(button.dataset.deleteVersion)
        )
      );
    });

    content.querySelectorAll('[data-new-item]').forEach((button) => {
      button.addEventListener('click', () =>
        openItemModal(
          Number(button.dataset.product),
          Number(button.dataset.version)
        )
      );
    });

    content.querySelectorAll('[data-edit-item]').forEach((button) => {
      button.addEventListener('click', () =>
        openItemModal(
          Number(button.dataset.product),
          Number(button.dataset.version),
          Number(button.dataset.item)
        )
      );
    });

    content.querySelectorAll('[data-delete-item]').forEach((button) => {
      button.addEventListener('click', () =>
        deleteItem(
          Number(button.dataset.product),
          Number(button.dataset.version),
          Number(button.dataset.item)
        )
      );
    });
  }

  function renderProduct(product, productIndex) {
    return `
      <section class="admin-card">

        <div class="admin-card-header">

          <div>
            <h2>
              ${UI.escape(product.name)}
            </h2>

            <span>
              ${product.versions.length}
              versão(ões)
            </span>
          </div>

          <div class="admin-card-actions">

            <button
              class="btn btn-secondary btn-sm"
              data-edit-product="${productIndex}"
            >
              Editar
            </button>

            <button
              class="btn btn-danger btn-sm"
              data-delete-product="${productIndex}"
            >
              Excluir
            </button>

            <button
              class="btn btn-primary btn-sm"
              data-new-version
              data-product="${productIndex}"
            >
              Nova versão
            </button>

          </div>

        </div>

        <div class="admin-card-body">

          ${
            product.versions.length
              ? product.versions
                  .map((version, versionIndex) =>
                    renderVersion(version, productIndex, versionIndex)
                  )
                  .join('')
              : `
                <div class="empty-state compact">
                  Nenhuma versão cadastrada.
                </div>
              `
          }

        </div>
      </section>
    `;
  }

  function renderVersion(version, productIndex, versionIndex) {
    return `
      <div class="version-admin">

        <div class="version-admin-header">

          <div>
            <strong>
              v${UI.escape(version.numero)}
            </strong>

            <span>
              ${UI.escape(version.data)}
            </span>

            <span class="status-pill ${version.hidden ? 'warning' : 'success'}">
              ${version.hidden ? 'Oculta' : 'Publicada'}
            </span>
          </div>

          <div class="admin-card-actions">

            <button
              class="btn btn-secondary btn-sm"
              data-edit-version="${versionIndex}"
              data-product="${productIndex}"
            >
              Editar
            </button>

            <button
              class="btn btn-secondary btn-sm"
              data-toggle-version="${versionIndex}"
              data-product="${productIndex}"
            >
              ${version.hidden ? 'Publicar' : 'Ocultar'}
            </button>

            <button
              class="btn btn-danger btn-sm"
              data-delete-version="${versionIndex}"
              data-product="${productIndex}"
            >
              Excluir
            </button>

          </div>

        </div>

        <p class="version-description-admin">
          ${UI.formatMultiline(version.descricao || '')}
        </p>

        <div class="version-items">

          ${
            version.items.length
              ? version.items
                  .map((item, itemIndex) =>
                    renderItem(item, productIndex, versionIndex, itemIndex)
                  )
                  .join('')
              : `
                <div class="empty-state compact">
                  Nenhuma entrega.
                </div>
              `
          }

        </div>

        <button
          class="btn btn-secondary btn-sm"
          data-new-item
          data-product="${productIndex}"
          data-version="${versionIndex}"
        >
          + Adicionar entrega
        </button>

      </div>
    `;
  }

  function renderItem(item, productIndex, versionIndex, itemIndex) {
    return `
      <div class="admin-item">

        <div>

          <div class="admin-item-meta">

            <span class="release-item-type ${typeClass(item.tipo)}">
              ${UI.escape(item.tipo)}
            </span>

            ${
              item.ticket
                ? `
                  <code>
                    #${UI.escape(item.ticket)}
                  </code>
                `
                : ''
            }

          </div>

          <strong>
            ${UI.escape(item.titulo)}
          </strong>

          <p>
            ${UI.escape(item.descricao || '')}
          </p>

          ${
            item.caminho
              ? `
                <small>
                  ${UI.escape(item.caminho)}
                </small>
              `
              : ''
          }

        </div>

        <div class="admin-card-actions">

          <button
            class="btn btn-secondary btn-sm"
            data-edit-item
            data-product="${productIndex}"
            data-version="${versionIndex}"
            data-item="${itemIndex}"
          >
            Editar
          </button>

          <button
            class="btn btn-danger btn-sm"
            data-delete-item
            data-product="${productIndex}"
            data-version="${versionIndex}"
            data-item="${itemIndex}"
          >
            Excluir
          </button>

        </div>

      </div>
    `;
  }

  function typeClass(type) {
    if (type === 'Implementação') {
      return 'tag-impl';
    }

    if (type === 'Melhoria') {
      return 'tag-melho';
    }

    return 'tag-corr';
  }

  function openProductModal(productIndex = null) {
    const data = Storage.loadData();

    const product = productIndex === null ? null : data.products[productIndex];

    UI.openModal(
      `
        <form id="product-form">

          <div class="field-group">
            <label>
              Nome do produto
            </label>

            <input
              id="product-name"
              required
              value="${product ? UI.escape(product.name) : ''}"
            />
          </div>

          <div class="modal-inline-actions">

            <button
              type="button"
              class="btn btn-secondary"
              data-modal-close
            >
              Cancelar
            </button>

            <button
              type="submit"
              class="btn btn-primary"
            >
              Salvar
            </button>

          </div>

        </form>
      `,
      {
        title: product ? 'Editar produto' : 'Novo produto',
      }
    );

    document
      .getElementById('product-form')
      .addEventListener('submit', (event) => {
        event.preventDefault();

        const name = document.getElementById('product-name').value.trim();

        if (!name) {
          UI.toast('Informe o nome do produto.', 'error');

          return;
        }

        const fresh = Storage.loadData();

        if (productIndex === null) {
          fresh.products.push({
            id: crypto.randomUUID(),
            name,
            versions: [],
          });
        } else {
          fresh.products[productIndex].name = name;
        }

        Storage.saveData(fresh);

        UI.closeModal();

        render();

        UI.toast('Produto salvo.');
      });
  }

  function deleteProduct(productIndex) {
    const data = Storage.loadData();

    const product = data.products[productIndex];

    if (!product) {
      return;
    }

    if (
      !UI.confirmAction(`Excluir "${product.name}" e todas as suas versões?`)
    ) {
      return;
    }

    data.products.splice(productIndex, 1);

    Storage.saveData(data);

    render();

    UI.toast('Produto excluído.');
  }

  function openVersionModal(productIndex, versionIndex = null) {
    const data = Storage.loadData();

    const product = data.products[productIndex];

    if (!product) {
      return;
    }

    const version =
      versionIndex === null ? null : product.versions[versionIndex];

    UI.openModal(
      `
        <form id="version-form">

          <div class="form-grid-2">

            <div class="field-group">
              <label>
                Versão
              </label>

              <input
                id="version-number"
                placeholder="1.2.0"
                required
                value="${version ? UI.escape(version.numero) : ''}"
              />
            </div>

            <div class="field-group">
              <label>
                Data
              </label>

              <input
                id="version-date"
                placeholder="DD/MM/AAAA"
                required
                value="${version ? UI.escape(version.data) : ''}"
              />
            </div>

          </div>

          <div class="field-group">

            <label>
              Descrição
            </label>

            <textarea
              id="version-description"
              rows="5"
            >${version ? UI.escape(version.descricao || '') : ''}</textarea>

          </div>

          <div class="modal-inline-actions">

            <button
              type="button"
              class="btn btn-secondary"
              data-modal-close
            >
              Cancelar
            </button>

            <button
              type="submit"
              class="btn btn-primary"
            >
              Salvar
            </button>

          </div>

        </form>
      `,
      {
        title: version ? 'Editar versão' : 'Nova versão',
      }
    );

    document
      .getElementById('version-form')
      .addEventListener('submit', (event) => {
        event.preventDefault();

        const fresh = Storage.loadData();

        const target = fresh.products[productIndex];

        const value = {
          id: version?.id || crypto.randomUUID(),

          numero: document.getElementById('version-number').value.trim(),

          data: document.getElementById('version-date').value.trim(),

          descricao: document
            .getElementById('version-description')
            .value.trim(),

          hidden: version?.hidden === true,

          items: version?.items || [],
        };

        if (!value.numero || !value.data) {
          UI.toast('Versão e data são obrigatórias.', 'error');

          return;
        }

        if (versionIndex === null) {
          target.versions.unshift(value);
        } else {
          target.versions[versionIndex] = value;
        }

        Storage.saveData(fresh);

        UI.closeModal();

        render();

        UI.toast('Versão salva.');
      });
  }

  function toggleVersion(productIndex, versionIndex) {
    const data = Storage.loadData();

    const version = data.products[productIndex]?.versions[versionIndex];

    if (!version) {
      return;
    }

    version.hidden = !version.hidden;

    Storage.saveData(data);

    render();

    UI.toast(version.hidden ? 'Versão ocultada.' : 'Versão publicada.');
  }

  function deleteVersion(productIndex, versionIndex) {
    const data = Storage.loadData();

    const version = data.products[productIndex]?.versions[versionIndex];

    if (!version) {
      return;
    }

    if (!UI.confirmAction(`Excluir a versão ${version.numero}?`)) {
      return;
    }

    data.products[productIndex].versions.splice(versionIndex, 1);

    Storage.saveData(data);

    render();

    UI.toast('Versão excluída.');
  }

  function openItemModal(productIndex, versionIndex, itemIndex = null) {
    const data = Storage.loadData();

    const item =
      itemIndex === null
        ? null
        : data.products[productIndex]?.versions[versionIndex]?.items[itemIndex];

    UI.openModal(
      `
        <form id="item-form">

          <div class="form-grid-2">

            <div class="field-group">
              <label>
                Ticket
              </label>

              <input
                id="item-ticket"
                value="${UI.escape(item?.ticket || '')}"
                placeholder="QA-200"
              />
            </div>

            <div class="field-group">
              <label>
                Tipo
              </label>

              <select id="item-type">

                ${['Implementação', 'Melhoria', 'Correção']
                  .map(
                    (type) => `
                      <option
                        value="${type}"
                        ${item?.tipo === type ? 'selected' : ''}
                      >
                        ${type}
                      </option>
                    `
                  )
                  .join('')}

              </select>
            </div>

          </div>

          <div class="field-group">
            <label>
              Título
            </label>

            <input
              id="item-title"
              required
              value="${UI.escape(item?.titulo || '')}"
            />
          </div>

          <div class="field-group">
            <label>
              Descrição
            </label>

            <textarea
              id="item-description"
              rows="6"
            >${UI.escape(item?.descricao || '')}</textarea>
          </div>

          <div class="field-group">
            <label>
              Caminho da funcionalidade
            </label>

            <input
              id="item-path"
              value="${UI.escape(item?.caminho || '')}"
              placeholder="Portal > Clientes > Cadastro"
            />
          </div>

          <div class="field-group">
            <label>
              Documentação
            </label>

            <input
              id="item-link"
              type="url"
              value="${UI.escape(item?.link || '')}"
              placeholder="https://..."
            />
          </div>

          <div class="modal-inline-actions">

            <button
              type="button"
              class="btn btn-secondary"
              data-modal-close
            >
              Cancelar
            </button>

            <button
              type="submit"
              class="btn btn-primary"
            >
              Salvar entrega
            </button>

          </div>

        </form>
      `,
      {
        title: item ? 'Editar entrega' : 'Nova entrega',

        size: 'lg',
      }
    );

    document.getElementById('item-form').addEventListener('submit', (event) => {
      event.preventDefault();

      const fresh = Storage.loadData();

      const version = fresh.products[productIndex]?.versions[versionIndex];

      if (!version) {
        return;
      }

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
        UI.toast('Informe o título.', 'error');

        return;
      }

      if (itemIndex === null) {
        version.items.push(value);
      } else {
        version.items[itemIndex] = value;
      }

      Storage.saveData(fresh);

      UI.closeModal();

      render();

      UI.toast('Entrega salva.');
    });
  }

  function deleteItem(productIndex, versionIndex, itemIndex) {
    const data = Storage.loadData();

    const version = data.products[productIndex]?.versions[versionIndex];

    const item = version?.items[itemIndex];

    if (!version || !item) {
      return;
    }

    if (!UI.confirmAction(`Excluir a entrega "${item.titulo}"?`)) {
      return;
    }

    version.items.splice(itemIndex, 1);

    Storage.saveData(data);

    render();

    UI.toast('Entrega excluída.');
  }

  function renderUsers(content) {
    const data = Storage.loadData();

    const totalPages = Math.max(1, Math.ceil(data.users.length / PAGE_SIZE));

    if (state.userPage > totalPages) {
      state.userPage = totalPages;
    }

    const start = (state.userPage - 1) * PAGE_SIZE;

    const users = data.users.slice(start, start + PAGE_SIZE);

    content.innerHTML = `
      <div class="admin-page-heading">

        <div>
          <div class="eyebrow">
            ADMINISTRAÇÃO
          </div>

          <h1>
            Usuários
          </h1>

          <p>
            Controle de acesso ao dashboard.
          </p>
        </div>

        <button
          class="btn btn-primary"
          id="new-user"
        >
          Novo usuário
        </button>

      </div>

      <div class="admin-table-wrap">

        <table class="admin-table">

          <thead>
            <tr>
              <th>Usuário</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>

            ${
              users.length
                ? users
                    .map(
                      (user, index) => `
                        <tr>

                          <td>
                            <strong>
                              ${UI.escape(user.name)}
                            </strong>

                            <small>
                              @${UI.escape(user.username)}
                            </small>
                          </td>

                          <td>
                            ${UI.escape(user.email || '—')}
                          </td>

                          <td>
                            ${UI.escape(Auth.getRoleLabel(user.role))}
                          </td>

                          <td>
                            <span class="status-pill ${
                              user.active !== false ? 'success' : 'danger'
                            }">
                              ${user.active !== false ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>

                          <td class="table-actions">

                            <button
                              class="btn btn-secondary btn-sm"
                              data-edit-user="${start + index}"
                            >
                              Editar
                            </button>

                            <button
                              class="btn btn-secondary btn-sm"
                              data-reset-user="${start + index}"
                            >
                              Senha
                            </button>

                            <button
                              class="btn btn-secondary btn-sm"
                              data-toggle-user="${start + index}"
                            >
                              ${user.active !== false ? 'Inativar' : 'Ativar'}
                            </button>

                          </td>

                        </tr>
                      `
                    )
                    .join('')
                : `
                    <tr>
                      <td colspan="5">
                        Nenhum usuário cadastrado.
                      </td>
                    </tr>
                  `
            }

          </tbody>

        </table>

      </div>

      ${pagination(totalPages, state.userPage, 'user-page')}
    `;

    document
      .getElementById('new-user')
      ?.addEventListener('click', () => openUserModal());

    content.querySelectorAll('[data-edit-user]').forEach((button) => {
      button.addEventListener('click', () =>
        openUserModal(Number(button.dataset.editUser))
      );
    });

    content.querySelectorAll('[data-reset-user]').forEach((button) => {
      button.addEventListener('click', () =>
        openResetUserModal(Number(button.dataset.resetUser))
      );
    });

    content.querySelectorAll('[data-toggle-user]').forEach((button) => {
      button.addEventListener('click', () =>
        toggleUser(Number(button.dataset.toggleUser))
      );
    });

    bindPagination(content, 'user-page', (page) => {
      state.userPage = page;

      render();
    });
  }

  function openUserModal(userIndex = null) {
    const data = Storage.loadData();

    const user = userIndex === null ? null : data.users[userIndex];

    UI.openModal(
      `
        <form id="user-form">

          <div class="field-group">
            <label>
              Nome
            </label>

            <input
              id="user-name"
              required
              value="${user ? UI.escape(user.name) : ''}"
            />
          </div>

          <div class="form-grid-2">

            <div class="field-group">
              <label>
                Usuário
              </label>

              <input
                id="user-username"
                required
                ${user ? 'disabled' : ''}
                value="${user ? UI.escape(user.username) : ''}"
              />
            </div>

            <div class="field-group">
              <label>
                Perfil
              </label>

              <select id="user-role">

                <option
                  value="USER"
                  ${!user || user.role === 'USER' ? 'selected' : ''}
                >
                  Usuário comum
                </option>

                <option
                  value="ADMIN"
                  ${user?.role === 'ADMIN' ? 'selected' : ''}
                >
                  Administrador
                </option>

              </select>
            </div>

          </div>

          <div class="field-group">
            <label>
              E-mail
            </label>

            <input
              id="user-email"
              type="email"
              value="${user ? UI.escape(user.email || '') : ''}"
            />
          </div>

          ${
            user
              ? ''
              : `
                  <div class="field-group">
                    <label>
                      Senha
                    </label>

                    <input
                      id="user-password"
                      type="password"
                      minlength="8"
                      required
                    />
                  </div>
                `
          }

          <div class="modal-inline-actions">

            <button
              type="button"
              class="btn btn-secondary"
              data-modal-close
            >
              Cancelar
            </button>

            <button
              type="submit"
              class="btn btn-primary"
            >
              Salvar
            </button>

          </div>

        </form>
      `,
      {
        title: user ? 'Editar usuário' : 'Novo usuário',
      }
    );

    document
      .getElementById('user-form')
      .addEventListener('submit', async (event) => {
        event.preventDefault();

        try {
          const fresh = Storage.loadData();

          if (user) {
            user.name = document.getElementById('user-name').value.trim();

            user.email = document
              .getElementById('user-email')
              .value.trim()
              .toLowerCase();

            user.role = document.getElementById('user-role').value;

            if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
              throw new Error('Informe um e-mail válido.');
            }

            fresh.users[userIndex] = user;

            Storage.saveData(fresh);
          } else {
            await Auth.createUser({
              name: document.getElementById('user-name').value,

              username: document.getElementById('user-username').value,

              email: document.getElementById('user-email').value,

              password: document.getElementById('user-password').value,

              role: document.getElementById('user-role').value,
            });
          }

          UI.closeModal();

          render();

          UI.toast('Usuário salvo.');
        } catch (error) {
          UI.toast(error.message, 'error');
        }
      });
  }

  function toggleUser(index) {
    const data = Storage.loadData();

    const user = data.users[index];

    if (!user) {
      return;
    }

    const session = Auth.getCurrentUser();

    if (session?.userId === user.id) {
      UI.toast('Você não pode inativar sua própria conta.', 'error');

      return;
    }

    user.active = user.active === false;

    Storage.saveData(data);

    render();

    UI.toast(user.active ? 'Usuário ativado.' : 'Usuário inativado.');
  }

  function openResetUserModal(index) {
    const data = Storage.loadData();

    const user = data.users[index];

    if (!user) {
      return;
    }

    UI.openModal(
      `
        <form id="admin-reset-form">

          <p class="modal-info">
            Nova senha para
            <strong>
              ${UI.escape(user.name)}
            </strong>.
          </p>

          <div class="field-group">
            <label>
              Nova senha
            </label>

            <input
              id="admin-new-password"
              type="password"
              minlength="8"
              required
            />
          </div>

          <div class="field-group">
            <label>
              Confirmar senha
            </label>

            <input
              id="admin-confirm-password"
              type="password"
              minlength="8"
              required
            />
          </div>

          <div class="modal-inline-actions">

            <button
              type="button"
              class="btn btn-secondary"
              data-modal-close
            >
              Cancelar
            </button>

            <button
              class="btn btn-primary"
              type="submit"
            >
              Redefinir
            </button>

          </div>

        </form>
      `,
      {
        title: 'Redefinir senha',
      }
    );

    document
      .getElementById('admin-reset-form')
      .addEventListener('submit', async (event) => {
        event.preventDefault();

        const password = document.getElementById('admin-new-password').value;

        const confirmation = document.getElementById(
          'admin-confirm-password'
        ).value;

        if (password !== confirmation) {
          UI.toast('As senhas não são iguais.', 'error');

          return;
        }

        try {
          await Auth.adminResetPassword(user.id, password);

          UI.closeModal();

          UI.toast('Senha redefinida.');
        } catch (error) {
          UI.toast(error.message, 'error');
        }
      });
  }

  function renderGroups(content) {
    const data = Storage.loadData();

    const totalPages = Math.max(
      1,
      Math.ceil(data.emailGroups.length / PAGE_SIZE)
    );

    if (state.groupPage > totalPages) {
      state.groupPage = totalPages;
    }

    const start = (state.groupPage - 1) * PAGE_SIZE;

    const groups = data.emailGroups.slice(start, start + PAGE_SIZE);

    content.innerHTML = `
      <div class="admin-page-heading">

        <div>
          <div class="eyebrow">
            ADMINISTRAÇÃO
          </div>

          <h1>
            Grupos de e-mail
          </h1>

          <p>
            Organize os destinatários dos relatórios.
          </p>
        </div>

        <button
          class="btn btn-primary"
          id="new-group"
        >
          Novo grupo
        </button>

      </div>

      <div class="group-grid">

        ${
          groups.length
            ? groups
                .map((group, index) => renderGroup(group, start + index))
                .join('')
            : `
              <div class="empty-state">
                <h2>
                  Nenhum grupo criado
                </h2>

                <p>
                  Crie grupos para facilitar o envio de relatórios.
                </p>
              </div>
            `
        }

      </div>

      ${pagination(totalPages, state.groupPage, 'group-page')}
    `;

    document
      .getElementById('new-group')
      ?.addEventListener('click', () => openGroupModal());

    content.querySelectorAll('[data-edit-group]').forEach((button) => {
      button.addEventListener('click', () =>
        openGroupModal(Number(button.dataset.editGroup))
      );
    });

    content.querySelectorAll('[data-toggle-group]').forEach((button) => {
      button.addEventListener('click', () =>
        toggleGroup(Number(button.dataset.toggleGroup))
      );
    });

    content.querySelectorAll('[data-delete-group]').forEach((button) => {
      button.addEventListener('click', () =>
        deleteGroup(Number(button.dataset.deleteGroup))
      );
    });

    bindPagination(content, 'group-page', (page) => {
      state.groupPage = page;

      render();
    });
  }

  function renderGroup(group, index) {
    return `
      <article class="group-card">

        <div class="group-card-head">

          <div>
            <h2>
              ${UI.escape(group.name)}
            </h2>

            <span>
              ${group.recipients.length}/25 destinatários
            </span>
          </div>

          <span class="status-pill ${
            group.active !== false ? 'success' : 'danger'
          }">
            ${group.active !== false ? 'Ativo' : 'Inativo'}
          </span>

        </div>

        <div class="group-recipient-list">

          ${
            group.recipients
              .map(
                (recipient) => `
                  <div class="recipient-row">

                    <div>
                      <strong>
                        ${UI.escape(recipient.name)}
                      </strong>

                      <small>
                        ${UI.escape(recipient.role)}
                      </small>
                    </div>

                    <span>
                      ${UI.escape(recipient.email)}
                    </span>

                  </div>
                `
              )
              .join('') ||
            `
              <div class="empty-state compact">
                Nenhum destinatário.
              </div>
            `
          }

        </div>

        <div class="group-card-actions">

          <button
            class="btn btn-secondary btn-sm"
            data-edit-group="${index}"
          >
            Editar
          </button>

          <button
            class="btn btn-secondary btn-sm"
            data-toggle-group="${index}"
          >
            ${group.active !== false ? 'Inativar' : 'Ativar'}
          </button>

          <button
            class="btn btn-danger btn-sm"
            data-delete-group="${index}"
          >
            Excluir
          </button>

        </div>

      </article>
    `;
  }

  function openGroupModal(groupIndex = null) {
    const data = Storage.loadData();

    const group = groupIndex === null ? null : data.emailGroups[groupIndex];

    let recipients = group?.recipients
      ? group.recipients.map((item) => ({
          ...item,
        }))
      : [];

    UI.openModal(
      `
        <form id="group-form">

          <div class="field-group">
            <label>
              Nome do grupo
            </label>

            <input
              id="group-name"
              required
              value="${group ? UI.escape(group.name) : ''}"
              placeholder="Ex.: Equipe de QA"
            />
          </div>

          <div class="recipient-editor">

            <div class="recipient-editor-head">

              <div>
                <strong>
                  Destinatários
                </strong>

                <span id="recipient-counter">
                  0/25
                </span>
              </div>

              <button
                type="button"
                class="btn btn-secondary btn-sm"
                id="add-recipient"
              >
                + Adicionar
              </button>

            </div>

            <div
              id="recipient-fields"
            ></div>

          </div>

          <div class="modal-inline-actions">

            <button
              type="button"
              class="btn btn-secondary"
              data-modal-close
            >
              Cancelar
            </button>

            <button
              type="submit"
              class="btn btn-primary"
            >
              Salvar grupo
            </button>

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
        .map(
          (recipient, index) => `
              <div
                class="recipient-form-row"
                data-recipient-row="${index}"
              >

                <div class="field-group">
                  <label>
                    Nome
                  </label>

                  <input
                    data-recipient-name
                    required
                    value="${UI.escape(recipient.name)}"
                  />
                </div>

                <div class="field-group">
                  <label>
                    Cargo
                  </label>

                  <input
                    data-recipient-role
                    required
                    value="${UI.escape(recipient.role)}"
                  />
                </div>

                <div class="field-group">
                  <label>
                    E-mail
                  </label>

                  <input
                    data-recipient-email
                    type="email"
                    required
                    value="${UI.escape(recipient.email)}"
                  />
                </div>

                <button
                  type="button"
                  class="btn btn-danger btn-sm"
                  data-remove-recipient="${index}"
                >
                  Remover
                </button>

              </div>
            `
        )
        .join('');

      document.getElementById('recipient-counter').textContent =
        `${recipients.length}/25`;

      fields.querySelectorAll('[data-remove-recipient]').forEach((button) => {
        button.addEventListener('click', () => {
          recipients.splice(Number(button.dataset.removeRecipient), 1);

          renderRecipients();
        });
      });
    }

    document.getElementById('add-recipient').addEventListener('click', () => {
      if (recipients.length >= 25) {
        UI.toast('Limite de 25 destinatários atingido.', 'error');

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

    renderRecipients();

    document
      .getElementById('group-form')
      .addEventListener('submit', (event) => {
        event.preventDefault();

        try {
          const fresh = Storage.loadData();

          const name = document.getElementById('group-name').value.trim();

          if (!name) {
            throw new Error('Informe o nome do grupo.');
          }

          const rows = [...fields.querySelectorAll('[data-recipient-row]')];

          const finalRecipients = rows.map((row) => ({
            id:
              recipients[Number(row.dataset.recipientRow)]?.id ||
              crypto.randomUUID(),

            name: row.querySelector('[data-recipient-name]').value.trim(),

            role: row.querySelector('[data-recipient-role]').value.trim(),

            email: row
              .querySelector('[data-recipient-email]')
              .value.trim()
              .toLowerCase(),
          }));

          if (finalRecipients.length > 25) {
            throw new Error('Um grupo pode ter no máximo 25 e-mails.');
          }

          const emailSet = new Set();

          finalRecipients.forEach((recipient) => {
            if (!recipient.name || !recipient.role) {
              throw new Error(
                'Preencha nome e cargo de todos os destinatários.'
              );
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient.email)) {
              throw new Error(`E-mail inválido: ${recipient.email}`);
            }

            if (emailSet.has(recipient.email)) {
              throw new Error('Não repita e-mails dentro do mesmo grupo.');
            }

            emailSet.add(recipient.email);
          });

          const value = {
            id: group?.id || crypto.randomUUID(),

            name,

            active: group?.active !== false,

            recipients: finalRecipients,

            updatedAt: new Date().toISOString(),
          };

          if (groupIndex === null) {
            fresh.emailGroups.push(value);
          } else {
            fresh.emailGroups[groupIndex] = value;
          }

          Storage.saveData(fresh);

          UI.closeModal();

          render();

          UI.toast('Grupo salvo.');
        } catch (error) {
          UI.toast(error.message, 'error');
        }
      });
  }

  function toggleGroup(index) {
    const data = Storage.loadData();

    const group = data.emailGroups[index];

    if (!group) {
      return;
    }

    group.active = group.active === false;

    Storage.saveData(data);

    render();

    UI.toast(group.active ? 'Grupo ativado.' : 'Grupo inativado.');
  }

  function deleteGroup(index) {
    const data = Storage.loadData();

    const group = data.emailGroups[index];

    if (!group) {
      return;
    }

    if (!UI.confirmAction(`Excluir o grupo "${group.name}"?`)) {
      return;
    }

    data.emailGroups.splice(index, 1);

    Storage.saveData(data);

    render();

    UI.toast('Grupo excluído.');
  }

  function pagination(totalPages, currentPage, type) {
    if (totalPages <= 1) {
      return '';
    }

    return `
      <nav class="pagination">

        <button
          class="pagination-button"
          data-pagination="${type}"
          data-page="${Math.max(1, currentPage - 1)}"
          ${currentPage === 1 ? 'disabled' : ''}
        >
          ‹
        </button>

        ${Array.from(
          {
            length: totalPages,
          },
          (_, index) => {
            const page = index + 1;

            return `
              <button
                class="pagination-button ${
                  page === currentPage ? 'active' : ''
                }"
                data-pagination="${type}"
                data-page="${page}"
              >
                ${page}
              </button>
            `;
          }
        ).join('')}

        <button
          class="pagination-button"
          data-pagination="${type}"
          data-page="${Math.min(totalPages, currentPage + 1)}"
          ${currentPage === totalPages ? 'disabled' : ''}
        >
          ›
        </button>

      </nav>
    `;
  }

  function bindPagination(content, type, callback) {
    content
      .querySelectorAll(`[data-pagination="${type}"]`)
      .forEach((button) => {
        button.addEventListener('click', () =>
          callback(Number(button.dataset.page))
        );
      });
  }

  function openProfile() {
    const user = Auth.getCurrentUserData();

    if (!user) {
      return;
    }

    UI.openModal(
      `
        <div class="profile-summary">

          <div class="avatar avatar-large">
            ${UI.escape(user.name.charAt(0).toUpperCase())}
          </div>

          <div>
            <h3>
              ${UI.escape(user.name)}
            </h3>

            <p>
              @${UI.escape(user.username)}
            </p>

            <span class="status-pill success">
              Administrador
            </span>
          </div>

        </div>

        <form id="admin-change-password">

          <div class="field-group">
            <label>
              Senha atual
            </label>

            <input
              id="admin-current-password"
              type="password"
              required
            />
          </div>

          <div class="field-group">
            <label>
              Nova senha
            </label>

            <input
              id="admin-profile-password"
              type="password"
              minlength="8"
              required
            />
          </div>

          <div class="field-group">
            <label>
              Confirmar senha
            </label>

            <input
              id="admin-profile-confirm"
              type="password"
              minlength="8"
              required
            />
          </div>

          <div class="modal-inline-actions">

            <button
              type="button"
              class="btn btn-secondary"
              data-modal-close
            >
              Cancelar
            </button>

            <button
              type="submit"
              class="btn btn-primary"
            >
              Alterar senha
            </button>

          </div>

        </form>
      `,
      {
        title: 'Meu perfil',
      }
    );

    document
      .getElementById('admin-change-password')
      .addEventListener('submit', async (event) => {
        event.preventDefault();

        const password = document.getElementById(
          'admin-profile-password'
        ).value;

        const confirm = document.getElementById('admin-profile-confirm').value;

        if (password !== confirm) {
          UI.toast('As senhas não são iguais.', 'error');

          return;
        }

        try {
          await Auth.changePassword(
            document.getElementById('admin-current-password').value,
            password
          );

          UI.closeModal();

          UI.toast('Senha alterada.');
        } catch (error) {
          UI.toast(error.message, 'error');
        }
      });
  }

  return {
    init,
  };
})();
