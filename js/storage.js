const Storage = (() => {
  const DATA_KEY = 'portfolio_data_v2';
  const SESSION_KEY = 'portfolio_session_v1';

  const CURRENT_VERSION = 2;

  const DEFAULT_DATA = {
    schemaVersion: CURRENT_VERSION,

    settings: {
      appName: 'Meu Sistema',
      logoUrl: 'images/icone.png',
      supportText:
        'Em caso de dúvidas sobre as alterações, entre em contato com o suporte.',
      supportUrl: '',
    },

    users: [],

    products: [
      {
        id: crypto.randomUUID(),
        name: 'Produto A',

        versions: [
          {
            id: crypto.randomUUID(),
            numero: '1.0.0',
            data: '16/05/2026',
            descricao: 'Primeira versão do produto.',

            items: [
              {
                id: crypto.randomUUID(),
                ticket: '101',
                tipo: 'Implementação',
                titulo: 'Funcionalidade inicial',
                descricao: 'Implementação da tela principal do sistema.',
                link: '',
              },
            ],
          },
        ],
      },
    ],
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function migrate(data) {
    if (!data || typeof data !== 'object') {
      return clone(DEFAULT_DATA);
    }

    if (!data.schemaVersion) {
      data.schemaVersion = 1;
    }

    if (!data.settings) {
      data.settings = clone(DEFAULT_DATA.settings);
    }

    if (!Array.isArray(data.users)) {
      data.users = [];
    }

    if (!Array.isArray(data.products)) {
      data.products = [];
    }

    /*
     * Migração da estrutura antiga:
     *
     * produto.versions
     * versão.items
     *
     * passam a possuir IDs.
     */

    data.products.forEach((product) => {
      if (!product.id) {
        product.id = crypto.randomUUID();
      }

      if (!Array.isArray(product.versions)) {
        product.versions = [];
      }

      product.versions.forEach((version) => {
        if (!version.id) {
          version.id = crypto.randomUUID();
        }

        if (!Array.isArray(version.items)) {
          version.items = [];
        }

        version.items.forEach((item) => {
          if (!item.id) {
            item.id = crypto.randomUUID();
          }

          if (!item.tipo) {
            item.tipo = 'Implementação';
          }

          if (!item.titulo) {
            item.titulo = '';
          }

          if (!item.descricao) {
            item.descricao = '';
          }

          if (!item.link) {
            item.link = '';
          }
        });
      });
    });

    data.schemaVersion = CURRENT_VERSION;

    return data;
  }

  function loadData() {
    try {
      const raw = localStorage.getItem(DATA_KEY);

      if (!raw) {
        return clone(DEFAULT_DATA);
      }

      return migrate(JSON.parse(raw));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);

      return clone(DEFAULT_DATA);
    }
  }

  function saveData(data) {
    const normalized = migrate(clone(data));

    localStorage.setItem(DATA_KEY, JSON.stringify(normalized));

    return normalized;
  }

  function clearData() {
    localStorage.removeItem(DATA_KEY);
  }

  function getSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);

      if (!raw) {
        return null;
      }

      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function setSession(session) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function exportData() {
    const data = loadData();

    return JSON.stringify(data, null, 2);
  }

  function importData(json) {
    const parsed = typeof json === 'string' ? JSON.parse(json) : json;

    if (!parsed || !Array.isArray(parsed.products)) {
      throw new Error('Arquivo de backup inválido.');
    }

    return saveData(parsed);
  }

  return {
    DATA_KEY,
    SESSION_KEY,

    loadData,
    saveData,

    getSession,
    setSession,
    clearSession,

    exportData,
    importData,

    clearData,
  };
})();
