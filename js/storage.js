const Storage = (() => {
  const DATA_KEY = 'portfolio_data_v2';
  const SESSION_KEY = 'portfolio_session_v1';

  const CURRENT_VERSION = 3;

  const uid = () =>
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const DEFAULT_DATA = {
    schemaVersion: CURRENT_VERSION,

    settings: {
      appName: 'Release Dashboard',
      logoUrl: 'images/icone.png',
      supportText:
        'Em caso de dúvidas sobre as alterações, entre em contato com o suporte.',
      supportUrl: '',
    },

    users: [],

    products: [
      {
        id: uid(),
        name: 'Portal do Cliente',
        versions: [
          {
            id: uid(),
            numero: '1.1.0',
            data: '16/05/2026',
            descricao:
              'Nova experiência do cliente, melhorias de navegação e ajustes no módulo administrativo.',
            items: [
              {
                id: uid(),
                ticket: 'QA-184',
                tipo: 'Implementação',
                titulo: 'Novo painel de indicadores',
                descricao:
                  'Permite consultar os principais indicadores diretamente na página inicial do portal.\n\nO novo painel reúne os dados mais relevantes em uma única visualização.',
                caminho: 'Portal > Dashboard > Indicadores',
                link: '',
              },
              {
                id: uid(),
                ticket: 'QA-185',
                tipo: 'Implementação',
                titulo: 'Novo cadastro de clientes',
                descricao:
                  'Novo fluxo para cadastro de clientes com validações de dados e mensagens de retorno mais claras.',
                caminho: 'Portal > Clientes > Novo cadastro',
                link: '',
              },
              {
                id: uid(),
                ticket: 'QA-186',
                tipo: 'Implementação',
                titulo: 'Controle de permissões',
                descricao:
                  'Adicionada uma estrutura de permissões para controlar o acesso às funcionalidades administrativas.',
                caminho: 'Administração > Usuários > Permissões',
                link: '',
              },
              {
                id: uid(),
                ticket: 'QA-187',
                tipo: 'Implementação',
                titulo: 'Exportação de relatórios',
                descricao:
                  'Relatórios de entregas podem ser exportados em formatos adequados para análise e backup.',
                caminho: 'Administração > Relatórios > Exportações',
                link: '',
              },
              {
                id: uid(),
                ticket: 'QA-188',
                tipo: 'Implementação',
                titulo: 'Histórico de solicitações',
                descricao:
                  'Novo histórico para acompanhamento das solicitações realizadas pelo cliente.',
                caminho: 'Portal > Solicitações > Histórico',
                link: '',
              },
              {
                id: uid(),
                ticket: 'QA-189',
                tipo: 'Melhoria',
                titulo: 'Melhoria na navegação',
                descricao:
                  'A navegação foi reorganizada para reduzir a quantidade de etapas necessárias para acessar as principais áreas.',
                caminho: 'Menu principal',
                link: '',
              },
              {
                id: uid(),
                ticket: 'QA-190',
                tipo: 'Melhoria',
                titulo: 'Mensagens de validação',
                descricao:
                  'As mensagens de validação foram revisadas para apresentar informações mais objetivas ao usuário.',
                caminho: 'Portal > Formulários',
                link: '',
              },
              {
                id: uid(),
                ticket: 'QA-191',
                tipo: 'Correção',
                titulo: 'Correção no fluxo de autenticação',
                descricao:
                  'Corrigido um comportamento que poderia impedir o acesso após uma sessão expirar.',
                caminho: 'Login > Autenticação',
                link: '',
              },
            ],
          },

          {
            id: uid(),
            numero: '1.0.0',
            data: '10/05/2026',
            descricao: 'Primeira versão publicada do produto.',
            items: [
              {
                id: uid(),
                ticket: 'QA-101',
                tipo: 'Implementação',
                titulo: 'Publicação inicial',
                descricao:
                  'Disponibilização da primeira versão do Portal do Cliente.',
                caminho: 'Portal > Página inicial',
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

  function normalizeItem(item) {
    if (!item.id) item.id = uid();

    if (!item.tipo) item.tipo = 'Implementação';
    if (!item.titulo) item.titulo = '';
    if (!item.descricao) item.descricao = '';
    if (!item.ticket) item.ticket = '';
    if (!item.link) item.link = '';
    if (!item.caminho) item.caminho = '';

    return item;
  }

  function normalizeVersion(version) {
    if (!version.id) version.id = uid();

    if (!Array.isArray(version.items)) {
      /*
       * Compatibilidade com a estrutura antiga de demonstração,
       * que utilizava "deliveries".
       */
      version.items = Array.isArray(version.deliveries)
        ? version.deliveries
        : [];
    }

    version.items = version.items.map(normalizeItem);

    delete version.deliveries;

    return version;
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

    if (!data.settings.appName) {
      data.settings.appName = 'Release Dashboard';
    }

    if (!data.settings.logoUrl) {
      data.settings.logoUrl = 'images/icone.png';
    }

    if (!Array.isArray(data.users)) {
      data.users = [];
    }

    if (!Array.isArray(data.products)) {
      data.products = [];
    }

    data.products.forEach((product) => {
      if (!product.id) product.id = uid();
      if (!product.name) product.name = 'Produto';

      if (!Array.isArray(product.versions)) {
        product.versions = [];
      }

      product.versions = product.versions.map(normalizeVersion);
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

      const data = migrate(JSON.parse(raw));

      /*
       * Persiste automaticamente a migração.
       */
      localStorage.setItem(DATA_KEY, JSON.stringify(data));

      return data;
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

      if (!raw) return null;

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
    return JSON.stringify(loadData(), null, 2);
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
    CURRENT_VERSION,

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
