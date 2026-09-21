import { json } from '@sveltejs/kit';
import { getPool } from '$lib/server/db.js';

export async function PUT(event) {
  const id = event.params.id;
  const body = await event.request.json();
  const pool = getPool();
  await pool.query('UPDATE users SET name=?, email=?, phone=?, avatar_url=? WHERE id=?', [body.name, body.email || null, body.phone || null, body.avatarUrl || null, id]);
  return json({ id: Number(id), name: body.name, username: body.username, role: body.role, email: body.email || '', phone: body.phone || '', avatarUrl: body.avatarUrl || '' });
}