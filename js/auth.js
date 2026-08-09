(function () {
  'use strict';

  const SESSION_KEY = 'qa-release-session';

  const ROLES = {
    ADMIN: 'ADMIN',
    USER: 'USER',
  };

  function getSession() {
    const raw = sessionStorage.getItem(SESSION_KEY);

    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function getCurrentUser() {
    const session = getSession();

    if (!session) return null;

    const data = Storage.loadData();

    return (
      data.users.find(function (user) {
        return user.id === session.userId && user.active !== false;
      }) || null
    );
  }

  function login(username, password) {
    const data = Storage.loadData();

    const user = data.users.find(function (item) {
      return item.username.toLowerCase() === username.toLowerCase();
    });

    if (!user) {
      throw new Error('Usuário ou senha inválidos.');
    }

    if (user.active === false) {
      throw new Error('Usuário inativo.');
    }

    if (user.password !== password) {
      throw new Error('Usuário ou senha inválidos.');
    }

    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        userId: user.id,
        loginAt: new Date().toISOString(),
      })
    );

    return user;
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    location.href = 'login.html';
  }

  function requireAuth() {
    const user = getCurrentUser();

    if (!user) {
      location.href = 'login.html';
      return null;
    }

    return user;
  }

  function requireAdmin() {
    const user = requireAuth();

    if (!user) return null;

    if (user.role !== ROLES.ADMIN) {
      location.href = 'index.html';
      return null;
    }

    return user;
  }

  function initLoginPage() {
    Storage.loadData();

    const current = getCurrentUser();

    if (current) {
      location.href =
        current.role === ROLES.ADMIN ? 'admin.html' : 'index.html';
      return;
    }

    const loginView = document.getElementById('login-view');
    const recoveryView = document.getElementById('recovery-view');
    const firstAccessView = document.getElementById('first-access-view');

    function show(view) {
      [loginView, recoveryView, firstAccessView].forEach(function (element) {
        element.classList.add('hidden');
      });

      view.classList.remove('hidden');
    }

    document
      .getElementById('forgot-password')
      .addEventListener('click', function () {
        show(recoveryView);
      });

    document
      .getElementById('first-access')
      .addEventListener('click', function () {
        show(firstAccessView);
      });

    document
      .getElementById('back-login-recovery')
      .addEventListener('click', function () {
        show(loginView);
      });

    document
      .getElementById('back-login-first')
      .addEventListener('click', function () {
        show(loginView);
      });

    document
      .getElementById('login-form')
      .addEventListener('submit', function (event) {
        event.preventDefault();

        try {
          const user = login(
            document.getElementById('login-username').value.trim(),
            document.getElementById('login-password').value
          );

          location.href =
            user.role === ROLES.ADMIN ? 'admin.html' : 'index.html';
        } catch (error) {
          UI.toast(error.message, 'error');
        }
      });

    document
      .getElementById('recovery-form')
      .addEventListener('submit', function (event) {
        event.preventDefault();

        const username = document
          .getElementById('recovery-username')
          .value.trim();
        const code = document.getElementById('recovery-code').value.trim();
        const password = document.getElementById('recovery-password').value;
        const confirm = document.getElementById('recovery-confirm').value;

        if (code !== 'QA-RECOVERY-120') {
          UI.toast('Código de recuperação inválido.', 'error');
          return;
        }

        if (password !== confirm) {
          UI.toast('As senhas não são iguais.', 'error');
          return;
        }

        const data = Storage.loadData();
        const user = data.users.find(function (item) {
          return item.username.toLowerCase() === username.toLowerCase();
        });

        if (!user) {
          UI.toast('Usuário não encontrado.', 'error');
          return;
        }

        user.password = password;
        user.firstAccess = false;

        Storage.saveData(data);

        UI.toast('Senha redefinida. Faça o login.');
        document.getElementById('recovery-form').reset();
        show(loginView);
      });

    document
      .getElementById('first-access-form')
      .addEventListener('submit', function (event) {
        event.preventDefault();

        const username = document
          .getElementById('first-access-username')
          .value.trim();
        const code = document.getElementById('first-access-code').value.trim();
        const password = document.getElementById('first-access-password').value;
        const confirm = document.getElementById('first-access-confirm').value;

        if (code !== 'QA-FIRST-120') {
          UI.toast('Código de primeiro acesso inválido.', 'error');
          return;
        }

        if (password !== confirm) {
          UI.toast('As senhas não são iguais.', 'error');
          return;
        }

        const data = Storage.loadData();
        const user = data.users.find(function (item) {
          return item.username.toLowerCase() === username.toLowerCase();
        });

        if (!user) {
          UI.toast('Usuário não encontrado.', 'error');
          return;
        }

        user.password = password;
        user.firstAccess = false;

        Storage.saveData(data);

        UI.toast('Acesso ativado. Faça o login.');
        document.getElementById('first-access-form').reset();
        show(loginView);
      });
  }

  window.Auth = {
    ROLES,
    getSession,
    getCurrentUser,
    login,
    logout,
    requireAuth,
    requireAdmin,
    initLoginPage,
  };
})();
