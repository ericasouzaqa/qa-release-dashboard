(function () {
  'use strict';

  const now = new Date();

  function id() {
    return crypto.randomUUID();
  }

  const products = [
    {
      id: id(),
      name: 'Portal do Cliente',
      active: true,
      versions: [
        {
          id: id(),
          numero: '1.2.0',
          data: '2026-08-08',
          descricao:
            'Melhorias no cadastro de clientes e validações de qualidade.',
          published: true,
          items: [
            {
              id: id(),
              ticket: 'QA-120',
              tipo: 'Implementação',
              titulo: 'Novo fluxo de cadastro',
              descricao:
                'Disponibilizado novo fluxo para cadastro de clientes.',
              caminho: 'Portal > Clientes > Cadastro',
              link: '',
            },
            {
              id: id(),
              ticket: 'QA-121',
              tipo: 'Melhoria',
              titulo: 'Validação de campos obrigatórios',
              descricao: 'Aprimoradas as mensagens de validação.',
              caminho: 'Portal > Clientes > Cadastro',
              link: '',
            },
            {
              id: id(),
              ticket: 'QA-122',
              tipo: 'Correção',
              titulo: 'Correção de máscara de telefone',
              descricao: 'Corrigida inconsistência na máscara de telefone.',
              caminho: 'Portal > Clientes > Cadastro',
              link: '',
            },
          ],
        },
        {
          id: id(),
          numero: '1.1.0',
          data: '2026-07-20',
          descricao: 'Aprimoramentos de pesquisa e experiência do usuário.',
          published: true,
          items: [
            {
              id: id(),
              ticket: 'QA-110',
              tipo: 'Melhoria',
              titulo: 'Pesquisa por nome',
              descricao: 'Pesquisa de clientes ficou mais rápida.',
              caminho: 'Portal > Clientes',
              link: '',
            },
            {
              id: id(),
              ticket: 'QA-111',
              tipo: 'Correção',
              titulo: 'Correção de ordenação',
              descricao: 'Corrigida ordenação da lista de clientes.',
              caminho: 'Portal > Clientes',
              link: '',
            },
            {
              id: id(),
              ticket: 'QA-112',
              tipo: 'Implementação',
              titulo: 'Filtro por status',
              descricao: 'Novo filtro por status do cliente.',
              caminho: 'Portal > Clientes',
              link: '',
            },
          ],
        },
        {
          id: id(),
          numero: '1.0.0',
          data: '2026-06-15',
          descricao: 'Primeira versão demonstrativa do produto.',
          published: true,
          items: [
            {
              id: id(),
              ticket: 'QA-100',
              tipo: 'Implementação',
              titulo: 'Cadastro de clientes',
              descricao: 'Primeiro fluxo de cadastro.',
              caminho: 'Portal > Clientes',
              link: '',
            },
          ],
        },
      ],
    },
    {
      id: id(),
      name: 'Gestão de Pedidos',
      active: true,
      versions: [
        {
          id: id(),
          numero: '2.0.0',
          data: '2026-08-05',
          descricao: 'Nova jornada de acompanhamento de pedidos.',
          published: true,
          items: [
            {
              id: id(),
              ticket: 'QA-200',
              tipo: 'Implementação',
              titulo: 'Acompanhamento de pedido',
              descricao: 'Nova tela de acompanhamento.',
              caminho: 'Pedidos > Acompanhamento',
              link: '',
            },
          ],
        },
        {
          id: id(),
          numero: '1.5.0',
          data: '2026-07-10',
          descricao: 'Melhorias no fluxo de aprovação.',
          published: true,
          items: [],
        },
        {
          id: id(),
          numero: '1.4.0',
          data: '2026-06-10',
          descricao: 'Correções de estabilidade.',
          published: false,
          items: [],
        },
      ],
    },
    {
      id: id(),
      name: 'Central de Atendimento',
      active: true,
      versions: [
        {
          id: id(),
          numero: '3.1.0',
          data: '2026-08-01',
          descricao: 'Melhorias no atendimento e classificação.',
          published: true,
          items: [],
        },
        {
          id: id(),
          numero: '3.0.0',
          data: '2026-07-01',
          descricao: 'Nova versão da central.',
          published: true,
          items: [],
        },
        {
          id: id(),
          numero: '2.9.0',
          data: '2026-06-01',
          descricao: 'Correções gerais.',
          published: false,
          items: [],
        },
      ],
    },
  ];

  const users = [
    {
      id: id(),
      name: 'Erica Souza',
      username: 'erica',
      email: 'erica.qa@example.com',
      role: 'ADMIN',
      active: true,
      firstAccess: false,
      password: 'QA@123456',
    },
    {
      id: id(),
      name: 'Ana Oliveira',
      username: 'ana.qa',
      email: 'ana.qa@example.com',
      role: 'USER',
      active: true,
      firstAccess: false,
      password: 'QA@123456',
    },
    {
      id: id(),
      name: 'Bruno Santos',
      username: 'bruno.qa',
      email: 'bruno.qa@example.com',
      role: 'USER',
      active: true,
      firstAccess: false,
      password: 'QA@123456',
    },
    {
      id: id(),
      name: 'Carla Mendes',
      username: 'carla.qa',
      email: 'carla.qa@example.com',
      role: 'USER',
      active: true,
      firstAccess: false,
      password: 'QA@123456',
    },
  ];

  const emailGroups = [
    {
      id: id(),
      name: 'QA',
      active: true,
      recipients: [
        {
          id: id(),
          name: 'Ana Oliveira',
          role: 'QA Analyst',
          email: 'ana.qa@example.com',
        },
        {
          id: id(),
          name: 'Bruno Santos',
          role: 'QA Engineer',
          email: 'bruno.qa@example.com',
        },
      ],
    },
    {
      id: id(),
      name: 'Gestão de Qualidade',
      active: true,
      recipients: [
        {
          id: id(),
          name: 'Carla Mendes',
          role: 'QA Lead',
          email: 'carla.qa@example.com',
        },
        {
          id: id(),
          name: 'Marina Costa',
          role: 'Quality Manager',
          email: 'marina.qa@example.com',
        },
      ],
    },
    {
      id: id(),
      name: 'Homologação',
      active: false,
      recipients: [
        {
          id: id(),
          name: 'Rafael Lima',
          role: 'QA Analyst',
          email: 'rafael.qa@example.com',
        },
      ],
    },
  ];

  window.QASeedData = {
    version: '1.2.0',
    createdAt: now.toISOString(),
    products,
    users,
    emailGroups,
  };
})();
