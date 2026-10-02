export async function onRequestGet(context) {
  const { env } = context;
  const { results } = await env.DB.prepare(`
    SELECT messages.content, messages.created_at, users.username 
    FROM messages 
    JOIN users ON messages.user_id = users.id 
    ORDER BY messages.id DESC LIMIT 50
  `).all();
  return Response.json(results ?? []);
}

export async function onRequestPost(context) {
  const { env, request } = context;
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return Response.json({ error: '未登录' }, { status: 401 });

  // 验证会话
  const session = await env.DB.prepare(
    'SELECT * FROM sessions WHERE token = ? AND expires_at > datetime("now")'
  ).bind(token).first();
  if (!session) return Response.json({ error: '登录已过期' }, { status: 401 });

  const { content } = await request.json();
  if (!content) return Response.json({ error: '内容不能为空' }, { status: 400 });

  await env.DB.prepare(
    'INSERT INTO messages (user_id, content) VALUES (?, ?)'
  ).bind(session.user_id, content).run();

  return Response.json({ success: true });
}
