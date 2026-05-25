// ===== PYO_DLT AUTH MODULE =====

const AUTH = {
  STORAGE_KEY: 'pyo_dlt_users',
  SESSION_KEY: 'pyo_dlt_session',

  getUsers() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
  },

  saveUsers(users) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  },

  getSession() {
    return JSON.parse(localStorage.getItem(this.SESSION_KEY) || 'null');
  },

  setSession(user) {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem(this.SESSION_KEY);
  },

  isLoggedIn() {
    return this.getSession() !== null;
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = '../index.html';
    }
  },

  requireGuest() {
    if (this.isLoggedIn()) {
      window.location.href = 'pages/dashboard.html';
    }
  },

  register({ username, password, fullname, email, department }) {
    const users = this.getUsers();
    if (users.find(u => u.username === username)) {
      return { ok: false, msg: 'ชื่อผู้ใช้นี้มีอยู่แล้ว' };
    }
    if (password.length < 6) {
      return { ok: false, msg: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' };
    }
    const user = {
      id: Date.now().toString(),
      username, password, fullname, email, department,
      role: users.length === 0 ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
      devices: []
    };
    users.push(user);
    this.saveUsers(users);
    this.setSession({ id: user.id, username, fullname, email, department, role: user.role });
    return { ok: true };
  },

  login(username, password) {
    const users = this.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return { ok: false, msg: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
    this.setSession({ id: user.id, username: user.username, fullname: user.fullname, email: user.email, department: user.department, role: user.role });
    return { ok: true };
  },

  logout() {
    this.clearSession();
    window.location.href = '../index.html';
  },

  getCurrentUser() {
    return this.getSession();
  },

  // Get all users for admin view
  getAllUsers() {
    return this.getUsers().map(u => ({
      id: u.id, username: u.username, fullname: u.fullname,
      email: u.email, department: u.department, role: u.role, createdAt: u.createdAt
    }));
  }
};

// ===== AUTH PAGE LOGIC =====
if (document.getElementById('auth-form')) {
  AUTH.requireGuest();

  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const tabs = document.querySelectorAll('.auth-tab');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      loginForm.style.display = target === 'login' ? 'block' : 'none';
      registerForm.style.display = target === 'register' ? 'block' : 'none';
    });
  });

  // Login submit
  document.getElementById('login-btn').addEventListener('click', () => {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    if (!username || !password) { showToast('กรุณากรอกข้อมูลให้ครบ', 'error'); return; }
    const result = AUTH.login(username, password);
    if (result.ok) {
      showToast('เข้าสู่ระบบสำเร็จ', 'success');
      setTimeout(() => window.location.href = 'pages/dashboard.html', 800);
    } else {
      showToast(result.msg, 'error');
    }
  });

  // Register submit
  document.getElementById('register-btn').addEventListener('click', () => {
    const fullname = document.getElementById('reg-fullname').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const department = document.getElementById('reg-department').value;
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    if (!fullname || !username || !password || !confirm) { showToast('กรุณากรอกข้อมูลให้ครบ', 'error'); return; }
    if (password !== confirm) { showToast('รหัสผ่านไม่ตรงกัน', 'error'); return; }
    const result = AUTH.register({ username, password, fullname, email, department });
    if (result.ok) {
      showToast('สมัครสมาชิกสำเร็จ', 'success');
      setTimeout(() => window.location.href = 'pages/dashboard.html', 800);
    } else {
      showToast(result.msg, 'error');
    }
  });

  // Enter key support
  document.querySelectorAll('#login-form .form-control').forEach(el => {
    el.addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('login-btn').click(); });
  });
}
