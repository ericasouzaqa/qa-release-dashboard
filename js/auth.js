const Auth = (() => {
  const SESSION_DURATION = 8 * 60 * 60 * 1000;

  const ROLES = {
    ADMIN: 'ADMIN',
    EDITOR: 'EDITOR',
    USER: 'USER',
  };

  async function hashPassword(password, salt) {
    const encoder = new TextEncoder();

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const bits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: encoder.encode(salt),
        iterations: 210000,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );

    return Array.from(new Uint8Array(bits))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  function generateSalt() {
    const bytes = crypto.getRandomValues(new Uint8Array(16));

    return Array.from(bytes)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  async function createUser({ name, username, password, role = ROLES.USER }) {
    name = name.trim();
    username = username.trim().toLowerCase();

    if (!name) {
      throw new Error('Nome obrigatório.');
    }

    if (!username) {
      throw new Error('Usuário obrigatório.');
    }

    if (password.length < 8) {
      throw new Error('A senha deve possuir pelo menos 8 caracteres.');
    }

    const data = Storage.loadData();

    const exists = data.users.some((user) => user.username === username);

    if (exists) {
      throw new Error('Este usuário já existe.');
    }

    const salt = generateSalt();

    const passwordHash = await hashPassword(password, salt);

    const user = {
      id: crypto.randomUUID(),

      name,
      username,

      passwordHash,
      salt,

      role,

      active: true,

      createdAt: new Date().toISOString(),
    };

    data.users.push(user);

    Storage.saveData(data);

    return user;
  }

  async function authenticate(username, password) {
    const data = Storage.loadData();

    username = username.trim().toLowerCase();

    const user = data.users.find(
      (item) => item.username === username && item.active !== false
    );

    if (!user) {
      throw new Error('Usuário ou senha inválidos.');
    }

    const hash = await hashPassword(password, user.salt);

    if (hash !== user.passwordHash) {
      throw new Error('Usuário ou senha inválidos.');
    }

    const session = {
      userId: user.id,
      name: user.name,
      username: user.username,
      role: user.role,

      createdAt: Date.now(),

      expiresAt: Date.now() + SESSION_DURATION,
    };

    Storage.setSession(session);

    return session;
  }

  function getCurrentUser() {
    const session = Storage.getSession();

    if (!session) {
      return null;
    }

    if (Date.now() > session.expiresAt) {
      logout();

      return null;
    }

    return session;
  }

  function requireAuth(allowedRoles = []) {
    const user = getCurrentUser();

    if (!user) {
      window.location.href = 'login.html';

      return null;
    }

    if (allowedRoles.length && !allowedRoles.includes(user.role)) {
      window.location.href = 'index.html';

      return null;
    }

    return user;
  }

  function canEdit() {
    const user = getCurrentUser();

    return !!user && (user.role === ROLES.ADMIN || user.role === ROLES.EDITOR);
  }

  function isAdmin() {
    const user = getCurrentUser();

    return !!user && user.role === ROLES.ADMIN;
  }

  function logout() {
    Storage.clearSession();

    window.location.href = 'index.html';
  }

  function getRoleLabel(role) {
    const labels = {
      ADMIN: 'Administrador',
      EDITOR: 'Editor',
      USER: 'Usuário',
    };

    return labels[role] || role;
  }

  async function setupFirstAdmin(name, username, password) {
    const data = Storage.loadData();

    if (data.users.length > 0) {
      throw new Error('O administrador inicial já foi criado.');
    }

    return createUser({
      name,
      username,
      password,
      role: ROLES.ADMIN,
    });
  }

  function initLoginPage() {
    const data = Storage.loadData();

    const loginForm = document.getElementById('login-form');

    const setupForm = document.getElementById('setup-form');

    const description = document.getElementById('auth-description');

    const message = document.getElementById('auth-message');

    if (!data.users.length) {
      loginForm.classList.add('hidden');

      setupForm.classList.remove('hidden');

      description.textContent =
        'Configure o primeiro administrador do sistema.';
    }

    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      message.textContent = '';

      const username = document.getElementById('login-user').value;

      const password = document.getElementById('login-password').value;

      try {
        const user = await authenticate(username, password);

        if (user.role === ROLES.USER) {
          window.location.href = 'index.html';

          return;
        }

        window.location.href = 'admin.html';
      } catch (error) {
        message.textContent = error.message;
      }
    });

    setupForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      message.textContent = '';

      try {
        await setupFirstAdmin(
          document.getElementById('setup-name').value,

          document.getElementById('setup-user').value,

          document.getElementById('setup-password').value
        );

        message.style.color = 'var(--success)';

        message.textContent = 'Administrador criado. Você já pode entrar.';

        setupForm.reset();

        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        message.style.color = 'var(--danger)';

        message.textContent = error.message;
      }
    });
  }

  return {
    ROLES,

    createUser,
    authenticate,

    getCurrentUser,
    requireAuth,

    canEdit,
    isAdmin,

    logout,

    getRoleLabel,

    initLoginPage,
  };
})();
