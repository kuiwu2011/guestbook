const authSection = document.getElementById('auth-section');
const boardSection = document.getElementById('board-section');
const authForm = document.getElementById('auth-form');
const formTitle = document.getElementById('form-title');
const authBtn = document.getElementById('auth-btn');
const toggleAuth = document.getElementById('toggle-auth');
const authMsg = document.getElementById('auth-msg');
const msgForm = document.getElementById('msg-form');
const messagesDiv = document.getElementById('messages');
const currentUserSpan = document.getElementById('current-user');

let isLogin = true;
let token = localStorage.getItem('token');
let username = localStorage.getItem('username');

// 切换登录/注册
toggleAuth.onclick = (e) => {
  e.preventDefault();
  isLogin = !isLogin;
  formTitle.textContent = isLogin ? '登录' : '注册';
  authBtn.textContent = isLogin ? '登录' : '注册';
  toggleAuth.textContent = isLogin ? '没有账号？去注册' : '已有账号？去登录';
  authMsg.textContent = '';
};

// 检查登录状态
function checkAuth() {
  if (token) {
    authSection.style.display = 'none';
    boardSection.style.display = 'block';
    currentUserSpan.textContent = username;
    loadMessages();
  } else {
    authSection.style.display = 'block';
    boardSection.style.display = 'none';
  }
}

// 认证（登录/注册）
authForm.onsubmit = async (e) => {
  e.preventDefault();
  const u = usernameInput.value.trim();
  const p = passwordInput.value.trim();
  if (!u || !p) return;

  const endpoint = isLogin ? '/api/login' : '/api/register';
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: u, password: p })
  });
  const data = await res.json();

  if (res.ok) {
    if (isLogin) {
      token = data.token;
      username = data.username;
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      checkAuth();
    } else {
      authMsg.textContent = '注册成功！请登录';
      isLogin = true;
      formTitle.textContent = '登录';
      authBtn.textContent = '登录';
      toggleAuth.textContent = '没有账号？去注册';
    }
  } else {
    authMsg.textContent = data.error || '操作失败';
  }
};

// 退出
document.getElementById('logout').onclick = (e) => {
  e.preventDefault();
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  token = null;
  username = null;
  checkAuth();
};

// 加载留言
async function loadMessages() {
  const res = await fetch('/api/messages');
  const msgs = await res.json();
  messagesDiv.innerHTML = '';
  msgs.forEach(m => {
    const div = document.createElement('div');
    div.className = 'message';
    div.innerHTML = `<div class="author">${m.username}</div><div>${m.content}</div><div class="time">${m.created_at}</div>`;
    messagesDiv.appendChild(div);
  });
}

// 发布留言
msgForm.onsubmit = async (e) => {
  e.preventDefault();
  const content = document.getElementById('msg-content').value.trim();
  if (!content) return;

  const res = await fetch('/api/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ content })
  });

  if (res.ok) {
    document.getElementById('msg-content').value = '';
    loadMessages();
  } else {
    alert('发布失败');
  }
};

// 页面加载时检查
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
checkAuth();
