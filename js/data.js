const DEFAULT_DATA = {
  settings: {
    appName: 'Meu Sistema',
    logoUrl: '',
    supportText:
      'Em caso de dúvidas sobre as alterações, entre em contato com o suporte.',
    supportUrl: '',
  },

  users: [
    {
      id: 'user-admin',
      username: 'admin',
      name: 'Administrador',
      password: 'admin123',
      role: 'admin',
      active: true,
    },

    {
      id: 'user-demo',
      username: 'usuario',
      name: 'Usuário Demo',
      password: '123456',
      role: 'viewer',
      active: true,
    },
  ],

  products: [
    {
      id: 'produto-a',

      name: 'Produto A',

      versions: [
        {
          id: 'version-100',

          numero: '1.0.0',

          data: '16/05/2026',

          descricao: 'Primeira versão do produto.',

          deliveries: [
            {
              id: 'delivery-101',

              ticket: '101',

              tipo: 'Implementação',

              titulo: 'Funcionalidade inicial',

              descricao: 'Implementação da tela principal do sistema.',

              link: '',
            },

            {
              id: 'delivery-102',

              ticket: '102',

              tipo: 'Correção',

              titulo: 'Ajuste no login',

              descricao:
                'Corrigido erro que impedia o login em alguns navegadores.',

              link: '',
            },
          ],
        },
      ],
    },
  ],
};
