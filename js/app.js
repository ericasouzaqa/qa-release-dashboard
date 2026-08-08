const App = (() => {
  let data;
  let curProdIdx = 0;
  let curVerIdx = 0;

  const TYPE_META = {
    Implementação: {
      dot: 'dot-impl',
      tag: 'tag-impl',
    },

    Melhoria: {
      dot: 'dot-melho',
      tag: 'tag-melho',
    },

    Correção: {
      dot: 'dot-corr',
      tag: 'tag-corr',
    },
  };

  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function today() {
    const d = new Date();

    return [
      String(d.getDate()).padStart(2, '0'),

      String(d.getMonth() + 1).padStart(2, '0'),

      d.getFullYear(),
    ].join('/');
  }

  function save(message = 'Salvo com sucesso.') {
    data = Storage.saveData(data);

    toast(message);
  }

  function toast(message) {
    const element = document.getElementById('toast');

    if (!element) return;

    document.getElementById('toast-msg').textContent = message;

    element.classList.add('show');

    clearTimeout(toast.timer);

    toast.timer = setTimeout(() => {
      element.classList.remove('show');
    }, 2200);
  }

  /* PUBLIC */

  function initPublic() {
    data = Storage.loadData();

    renderPublic();
  }

  function renderPublic() {
    renderProductSelect();
    renderSidebar();
    renderView();
  }

  function renderProductSelect() {
    const select = document.getElementById('prod-sel');

    if (!select) return;

    select.innerHTML = data.products
      .map(
        (product, index) => `
            <option value="${index}">
              ${esc(product.name)}
            </option>
          `
      )
      .join('');

    if (data.products.length) {
      select.value = curProdIdx;
    }

    select.onchange = () => {
      curProdIdx = Number(select.value);

      curVerIdx = 0;

      renderSidebar();
      renderView();
    };
  }

  function renderSidebar() {
    const list = document.getElementById('ver-list');

    if (!list) return;

    const product = data.products[curProdIdx];

    if (!product) {
      list.innerHTML = '';

      return;
    }

    list.innerHTML = product.versions
      .map(
        (version, index) => `
            <li>
              <a
                href="#"
                class="${index === curVerIdx ? 'active' : ''}"
                data-index="${index}"
              >
                <span>
                  v${esc(version.numero)}
                </span>

                <span class="vd">
                  ${esc(version.data)}
                </span>
              </a>
            </li>
          `
      )
      .join('');

    list.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();

        curVerIdx = Number(link.dataset.index);

        renderSidebar();
        renderView();
      });
    });
  }

  function renderView() {
    const main = document.getElementById('main-content');

    if (!main) return;

    const product = data.products[curProdIdx];

    if (!product) {
      main.innerHTML = `
        <div class="empty">
          <h3>Nenhum produto cadastrado</h3>
          <p>Não existem produtos disponíveis.</p>
        </div>
      `;

      return;
    }

    const version = product.versions[curVerIdx];

    if (!version) {
      main.innerHTML = `
        <div class="empty">
          <h3>Nenhuma versão cadastrada</h3>
          <p>Este produto ainda não possui versões.</p>
        </div>
      `;

      return;
    }

    const groups = {
      Implementação: [],
      Melhoria: [],
      Correção: [],
    };

    version.items.forEach((item) => {
      if (!groups[item.tipo]) {
        groups[item.tipo] = [];
      }

      groups[item.tipo].push(item);
    });

    let sections = '';

    Object.entries(groups).forEach(([type, items]) => {
      if (!items.length) return;

      const meta = TYPE_META[type] || TYPE_META.Implementação;

      sections += `
            <section class="cat-section">

              <div class="cat-title">

                <span
                  class="dot ${meta.dot}"
                ></span>

                ${esc(type)}

              </div>

              ${items
                .map(
                  (item) => `

                    <article class="item-card">

                      <div class="item-ticket">
                        ${item.ticket ? '#' + esc(item.ticket) : '—'}
                      </div>

                      <div>

                        <span
                          class="tag ${meta.tag}"
                        >
                          ${esc(item.tipo)}
                        </span>

                        <div class="item-title-view">
                          ${esc(item.titulo)}
                        </div>

                        <div class="item-desc-view">
                          ${esc(item.descricao)}
                        </div>

                        ${
                          item.link
                            ? `
                              <a
                                class="item-link-view"
                                href="${esc(item.link)}"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                ↗ Manual de utilização
                              </a>
                            `
                            : ''
                        }

                      </div>

                    </article>

                  `
                )
                .join('')}

            </section>
          `;
    });

    const settings = data.settings;

    const support = settings.supportUrl
      ? `
          <a
            href="${esc(settings.supportUrl)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            ${esc(settings.supportText)}
          </a>
        `
      : esc(settings.supportText);

    main.innerHTML = `

      <div class="v-header">

        <span class="v-num">
          v${esc(version.numero)}
        </span>

        <span class="v-date">
          ${esc(version.data)}
        </span>

      </div>

      ${
        version.descricao
          ? `
            <p class="v-desc">
              ${esc(version.descricao)}
            </p>
          `
          : ''
      }

      ${
        sections ||
        `
          <div class="empty">
            <h3>
              Sem entregas nesta versão
            </h3>

            <p>
              Esta versão ainda não possui itens documentados.
            </p>
          </div>
        `
      }

      <div class="footer-note">
        ℹ &nbsp; ${support}
      </div>

    `;

    const topName = document.getElementById('topName');

    if (topName) {
      topName.textContent = settings.appName || 'Sistema';
    }
  }

  /* ADMIN */

  function initAdmin() {
    const user = Auth.requireAuth([Auth.ROLES.ADMIN, Auth.ROLES.EDITOR]);

    if (!user) return;

    data = Storage.loadData();

    document.getElementById('logged-user').textContent =
      `${user.name} · ${Auth.getRoleLabel(user.role)}`;

    document.getElementById('logout-btn').onclick = Auth.logout;

    document.querySelectorAll('.admin-nav').forEach((button) => {
      button.addEventListener('click', () => {
        switchPanel(button.dataset.panel);
      });
    });

    document.getElementById('add-product-btn').onclick = addProduct;

    document.getElementById('add-user-btn').onclick = openCreateUserModal;

    if (!Auth.isAdmin()) {
      document.getElementById('users-nav').classList.add('hidden');

      document.getElementById('add-user-btn').classList.add('hidden');
    }

    document.getElementById('modal-close').onclick = closeModal;

    renderAdmin();
  }

  function switchPanel(panel) {
    document.querySelectorAll('.admin-nav').forEach((button) => {
      button.classList.toggle('active', button.dataset.panel === panel);
    });

    document
      .getElementById('panel-content')
      .classList.toggle('hidden', panel !== 'content');

    document
      .getElementById('panel-users')
      .classList.toggle('hidden', panel !== 'users');

    if (panel === 'users') {
      renderUsers();
    }
  }

  function renderAdmin() {
    renderProducts();
    renderUsers();
  }

  function renderProducts() {
    const container = document.getElementById('admin-products');

    if (!container) return;

    if (!data.products.length) {
      container.innerHTML = `
        <div class="empty">
          <h3>Nenhum produto</h3>
          <p>Cadastre o primeiro produto.</p>
        </div>
      `;

      return;
    }

    container.innerHTML = data.products
      .map(
        (product, productIndex) => `

            <section
              class="section-card"
            >

              <div class="section-header">

                <input
                  type="text"
                  value="${esc(product.name)}"
                  aria-label="Nome do produto"
                  data-product-name="${productIndex}"
                >

                <button
                  class="btn btn-danger btn-sm"
                  onclick="App.removeProduct(${productIndex})"
                >
                  Excluir
                </button>

              </div>

              <div class="section-body">

                <div style="
                  display:flex;
                  justify-content:flex-end;
                  margin-bottom:12px;
                ">

                  <button
                    class="btn btn-primary btn-sm"
                    onclick="App.addVersion(${productIndex})"
                  >
                    + Versão
                  </button>

                </div>

                ${product.versions
                  .map((version, versionIndex) =>
                    renderVersion(productIndex, version, versionIndex)
                  )
                  .join('')}

              </div>

            </section>

          `
      )
      .join('');

    container.querySelectorAll('[data-product-name]').forEach((input) => {
      input.addEventListener('change', () => {
        const index = Number(input.dataset.productName);

        const name = input.value.trim();

        if (!name) {
          toast('O nome do produto é obrigatório.');

          input.value = data.products[index].name;

          return;
        }

        data.products[index].name = name;

        save();
      });
    });
  }

  function renderVersion(productIndex, version, versionIndex) {
    return `

      <div class="version-admin">

        <div class="version-admin-header">

          <strong>
            Versão
          </strong>

          <button
            class="btn btn-danger btn-sm"
            onclick="
              App.removeVersion(
                ${productIndex},
                ${versionIndex}
              )
            "
          >
            Excluir
          </button>

        </div>

        <div class="item-fields">

          <div class="field-group">

            <label>
              Número
            </label>

            <input
              type="text"
              value="${esc(version.numero)}"
              onchange="
                App.updateVersion(
                  ${productIndex},
                  ${versionIndex},
                  'numero',
                  this.value
                )
              "
            >

          </div>

          <div class="field-group">

            <label>
              Data
            </label>

            <input
              type="text"
              value="${esc(version.data)}"
              onchange="
                App.updateVersion(
                  ${productIndex},
                  ${versionIndex},
                  'data',
                  this.value
                )
              "
            >

          </div>

          <div class="field-group">

            <label>
              Descrição
            </label>

            <input
              type="text"
              value="${esc(version.descricao)}"
              onchange="
                App.updateVersion(
                  ${productIndex},
                  ${versionIndex},
                  'descricao',
                  this.value
                )
              "
            >

          </div>

        </div>

        <div style="margin-top:14px">

          <strong style="font-size:12px">
            Entregas
          </strong>

          <div style="margin-top:10px">

            ${version.items
              .map((item, itemIndex) =>
                renderItem(productIndex, versionIndex, item, itemIndex)
              )
              .join('')}

          </div>

          <button
            class="btn btn-ghost btn-sm"
            onclick="
              App.addItem(
                ${productIndex},
                ${versionIndex}
              )
            "
          >
            + Adicionar entrega
          </button>

        </div>

      </div>

    `;
  }

  function renderItem(productIndex, versionIndex, item, itemIndex) {
    return `

      <div class="item-edit-card">

        <div class="item-edit-header">

          <span>
            Entrega ${itemIndex + 1}
          </span>

          <button
            class="btn btn-danger btn-sm"
            onclick="
              App.removeItem(
                ${productIndex},
                ${versionIndex},
                ${itemIndex}
              )
            "
          >
            Excluir
          </button>

        </div>

        <div class="item-fields">

          <div class="field-group">

            <label>
              Ticket
            </label>

            <input
              type="text"
              value="${esc(item.ticket)}"
              onchange="
                App.updateItem(
                  ${productIndex},
                  ${versionIndex},
                  ${itemIndex},
                  'ticket',
                  this.value
                )
              "
            >

          </div>

          <div class="field-group">

            <label>
              Tipo
            </label>

            <select
              onchange="
                App.updateItem(
                  ${productIndex},
                  ${versionIndex},
                  ${itemIndex},
                  'tipo',
                  this.value
                )
              "
            >

              <option
                ${item.tipo === 'Implementação' ? 'selected' : ''}
              >
                Implementação
              </option>

              <option
                ${item.tipo === 'Melhoria' ? 'selected' : ''}
              >
                Melhoria
              </option>

              <option
                ${item.tipo === 'Correção' ? 'selected' : ''}
              >
                Correção
              </option>

            </select>

          </div>

          <div class="field-group">

            <label>
              Título
            </label>

            <input
              type="text"
              value="${esc(item.titulo)}"
              onchange="
                App.updateItem(
                  ${productIndex},
                  ${versionIndex},
                  ${itemIndex},
                  'titulo',
                  this.value
                )
              "
            >

          </div>

        </div>

        <div class="field-group">

          <label>
            Descrição da entrega
          </label>

          <textarea
            onchange="
              App.updateItem(
                ${productIndex},
                ${versionIndex},
                ${itemIndex},
                'descricao',
                this.value
              )
            "
          >${esc(item.descricao)}</textarea>

        </div>

        <div class="field-group">

          <label>
            Link / Manual
          </label>

          <input
            type="url"
            value="${esc(item.link)}"
            placeholder="https://..."
            onchange="
              App.updateItem(
                ${productIndex},
                ${versionIndex},
                ${itemIndex},
                'link',
                this.value
              )
            "
          >

        </div>

      </div>

    `;
  }

  function addProduct() {
    const product = {
      id: crypto.randomUUID(),

      name: 'Novo produto',

      versions: [
        {
          id: crypto.randomUUID(),

          numero: '1.0.0',

          data: today(),

          descricao: '',

          items: [],
        },
      ],
    };

    data.products.push(product);

    save('Produto criado.');

    renderProducts();
  }

  function removeProduct(index) {
    if (!confirm('Excluir este produto e todas as suas versões?')) {
      return;
    }

    data.products.splice(index, 1);

    save('Produto excluído.');

    renderProducts();
  }

  function addVersion(productIndex) {
    data.products[productIndex].versions.unshift({
      id: crypto.randomUUID(),

      numero: '',

      data: today(),

      descricao: '',

      items: [],
    });

    save('Versão criada.');

    renderProducts();
  }

  function removeVersion(productIndex, versionIndex) {
    if (!confirm('Excluir esta versão e todas as entregas?')) {
      return;
    }

    data.products[productIndex].versions.splice(versionIndex, 1);

    save('Versão excluída.');

    renderProducts();
  }

  function updateVersion(productIndex, versionIndex, field, value) {
    data.products[productIndex].versions[versionIndex][field] = value;

    save();
  }

  function addItem(productIndex, versionIndex) {
    data.products[productIndex].versions[versionIndex].items.push({
      id: crypto.randomUUID(),

      ticket: '',

      tipo: 'Implementação',

      titulo: '',

      descricao: '',

      link: '',
    });

    save('Entrega adicionada.');

    renderProducts();
  }

  function removeItem(productIndex, versionIndex, itemIndex) {
    if (!confirm('Excluir esta entrega?')) {
      return;
    }

    data.products[productIndex].versions[versionIndex].items.splice(
      itemIndex,
      1
    );

    save('Entrega excluída.');

    renderProducts();
  }

  function updateItem(productIndex, versionIndex, itemIndex, field, value) {
    data.products[productIndex].versions[versionIndex].items[itemIndex][field] =
      value;

    save();
  }

  /* USERS */

  function renderUsers() {
    const container = document.getElementById('admin-users');

    if (!container) return;

    if (!Auth.isAdmin()) {
      container.innerHTML = `
        <div class="empty">
          <h3>Acesso restrito</h3>
          <p>
            Apenas administradores podem gerenciar usuários.
          </p>
        </div>
      `;

      return;
    }

    const users = data.users;

    if (!users.length) {
      container.innerHTML = `
        <div class="empty">
          <h3>Nenhum usuário cadastrado</h3>
        </div>
      `;

      return;
    }

    container.innerHTML = users
      .map(
        (user) => `

            <div class="user-row">

              <div class="user-info">

                <div class="user-name">
                  ${esc(user.name)}
                </div>

                <div class="user-meta">
                  @${esc(user.username)}
                </div>

              </div>

              <span class="role-badge">
                ${esc(Auth.getRoleLabel(user.role))}
              </span>

              <button
                class="btn btn-danger btn-sm"
                onclick="
                  App.removeUser('${user.id}')
                "
              >
                Excluir
              </button>

            </div>

          `
      )
      .join('');
  }

  function openCreateUserModal() {
    if (!Auth.isAdmin()) {
      toast('Acesso restrito ao administrador.');

      return;
    }

    openModal(
      'Cadastrar usuário',
      `

        <form id="create-user-form">

          <div class="field-group">

            <label>
              Nome
            </label>

            <input
              id="new-user-name"
              type="text"
              required
            >

          </div>

          <div class="field-group">

            <label>
              Usuário
            </label>

            <input
              id="new-user-username"
              type="text"
              required
            >

          </div>

          <div class="field-group">

            <label>
              Senha
            </label>

            <input
              id="new-user-password"
              type="password"
              minlength="8"
              required
            >

          </div>

          <div class="field-group">

            <label>
              Perfil
            </label>

            <select id="new-user-role">

              <option value="USER">
                Usuário
              </option>

              <option value="EDITOR">
                Editor
              </option>

              <option value="ADMIN">
                Administrador
              </option>

            </select>

          </div>

          <div class="modal-actions">

            <button
              type="button"
              class="btn btn-ghost"
              onclick="App.closeModal()"
            >
              Cancelar
            </button>

            <button
              type="submit"
              class="btn btn-primary"
            >
              Cadastrar
            </button>

          </div>

        </form>

      `
    );

    document
      .getElementById('create-user-form')
      .addEventListener('submit', async (event) => {
        event.preventDefault();

        try {
          await Auth.createUser({
            name: document.getElementById('new-user-name').value,

            username: document.getElementById('new-user-username').value,

            password: document.getElementById('new-user-password').value,

            role: document.getElementById('new-user-role').value,
          });

          data = Storage.loadData();

          closeModal();

          renderUsers();

          toast('Usuário cadastrado.');
        } catch (error) {
          toast(error.message);
        }
      });
  }

  function removeUser(userId) {
    if (!Auth.isAdmin()) {
      toast('Acesso restrito.');

      return;
    }

    const current = Auth.getCurrentUser();

    if (current && current.userId === userId) {
      toast('Você não pode excluir seu próprio usuário.');

      return;
    }

    if (!confirm('Excluir este usuário?')) {
      return;
    }

    data.users = data.users.filter((user) => user.id !== userId);

    save('Usuário excluído.');

    renderUsers();
  }

  /* MODAL */

  function openModal(title, content) {
    document.getElementById('modal-title').textContent = title;

    document.getElementById('modal-content').innerHTML = content;

    document.getElementById('modal-bg').classList.add('open');
  }

  function closeModal() {
    document.getElementById('modal-bg').classList.remove('open');
  }

  return {
    initPublic,
    initAdmin,

    addProduct,
    removeProduct,

    addVersion,
    removeVersion,
    updateVersion,

    addItem,
    removeItem,
    updateItem,

    removeUser,

    openModal,
    closeModal,
  };
})();
