import { generateSalt, hashPassword } from '../_utils/auth.js';

export async function onRequestPost(context) {
  const { env, request } = context;
  const { username, password } = await request.json();

  if (!username || !password) {
    return Response.json({ error: '用户名和密码不能为空' }, { status: 400 });
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);

  try {
    await env.DB.prepare(
      'INSERT INTO users (username, password_hash, salt) VALUES (?, ?, ?)'
    ).bind(username, passwordHash, salt).run();
    return Response.json({ success: true });
  } catch (e) {
    if (e.message.includes('UNIQUE')) {
      return Response.json({ error: '用户名已存在' }, { status: 409 });
    }
    return Response.json({ error: '注册失败' }, { status: 500 });
  }
}
