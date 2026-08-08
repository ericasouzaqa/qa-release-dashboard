const DEMO_DATA = {
  settings: {
    appName: 'Release Dashboard',
    logoUrl: 'images/icone.png',
    supportText:
      'Em caso de dúvidas sobre uma entrega, consulte a documentação ou entre em contato com o suporte.',
    supportUrl: '',
  },

  products: [
    {
      id: 'demo-portal-cliente',
      name: 'Portal do Cliente',
      versions: [
        {
          id: 'demo-v110',
          numero: '1.1.0',
          data: '16/05/2026',
          descricao:
            'Nova experiência do cliente, melhorias de navegação e ajustes no módulo administrativo.',
          items: [
            {
              id: 'demo-184',
              ticket: 'QA-184',
              tipo: 'Implementação',
              titulo: 'Novo painel de indicadores',
              descricao:
                'Permite consultar os principais indicadores diretamente na página inicial do portal.\n\nO painel reúne as informações mais importantes em uma única visualização.',
              caminho: 'Portal > Dashboard > Indicadores',
              link: '',
            },
            {
              id: 'demo-185',
              ticket: 'QA-185',
              tipo: 'Implementação',
              titulo: 'Novo cadastro de clientes',
              descricao:
                'Novo fluxo para cadastro de clientes com validações de dados e mensagens de retorno mais claras.',
              caminho: 'Portal > Clientes > Novo cadastro',
              link: '',
            },
            {
              id: 'demo-186',
              ticket: 'QA-186',
              tipo: 'Implementação',
              titulo: 'Controle de permissões',
              descricao:
                'Adicionada uma estrutura de permissões para controlar o acesso às funcionalidades administrativas.',
              caminho: 'Administração > Usuários > Permissões',
              link: '',
            },
            {
              id: 'demo-187',
              ticket: 'QA-187',
              tipo: 'Implementação',
              titulo: 'Exportação de relatórios',
              descricao:
                'Relatórios de entregas podem ser exportados para análise e backup.',
              caminho: 'Administração > Relatórios > Exportações',
              link: '',
            },
            {
              id: 'demo-188',
              ticket: 'QA-188',
              tipo: 'Implementação',
              titulo: 'Histórico de solicitações',
              descricao:
                'Novo histórico para acompanhamento das solicitações realizadas pelo cliente.',
              caminho: 'Portal > Solicitações > Histórico',
              link: '',
            },
            {
              id: 'demo-189',
              ticket: 'QA-189',
              tipo: 'Melhoria',
              titulo: 'Melhoria na navegação',
              descricao:
                'A navegação foi reorganizada para reduzir etapas e facilitar o acesso às principais áreas.',
              caminho: 'Menu principal',
              link: '',
            },
            {
              id: 'demo-190',
              ticket: 'QA-190',
              tipo: 'Melhoria',
              titulo: 'Mensagens de validação',
              descricao:
                'As mensagens de validação foram revisadas para apresentar informações mais objetivas.',
              caminho: 'Portal > Formulários',
              link: '',
            },
            {
              id: 'demo-191',
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
      ],
    },
  ],
};
