import { hashPassword } from '../_utils/auth.js';

export async function onRequestPost(context) {
  const { env, request } = context;
  const { username, password } = await request.json();

  const user = await env.DB.prepare(
    'SELECT * FROM users WHERE username = ?'
  ).bind(username).first();

  if (!user) {
    return Response.json({ error: '用户不存在' }, { status: 401 });
  }

  const hash = await hashPassword(password, user.salt);
  if (hash !== user.password_hash) {
    return Response.json({ error: '密码错误' }, { status: 401 });
  }

  // 创建会话
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await env.DB.prepare(
    'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)'
  ).bind(user.id, token, expiresAt).run();

  return Response.json({ token, username: user.username });
}
