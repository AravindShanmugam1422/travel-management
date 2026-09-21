import { json } from '@sveltejs/kit';
import { getPool } from '$lib/server/db.js';

function adminOnly(event) {
  return event.request.headers.get('x-user-role') === 'head_office';
}

export async function PUT(event) {
  const id = event.params.id;
  const body = await event.request.json();
  const pool = getPool();
  if (adminOnly(event)) {
    const [target] = await pool.query("SELECT role FROM users WHERE id=? AND role IN ('manager','agent')", [id]);
    if (!target.length) return json({ error: 'Only manager and agent accounts can be edited.' }, { status: 400 });
    await pool.query('UPDATE users SET name=?, username=?, email=?, phone=?, manager_id=? WHERE id=?', [body.name, body.username, body.email || null, body.phone || null, body.managerId || null, id]);
    return json({ id: Number(id), ...body });
  }
  if (Number(event.request.headers.get('x-user-id')) !== Number(id)) return json({ error: 'You can only edit your own profile.' }, { status: 403 });
  await pool.query('UPDATE users SET name=?, email=?, phone=?, avatar_url=? WHERE id=?', [body.name, body.email || null, body.phone || null, body.avatarUrl || null, id]);
  return json({ id: Number(id), name: body.name, username: body.username, role: body.role, email: body.email || '', phone: body.phone || '', avatarUrl: body.avatarUrl || '' });
}

export async function DELETE(event) {
  if (!adminOnly(event)) return json({ error: 'Only Head Office can delete users.' }, { status: 403 });
  const id = event.params.id;
  const pool = getPool();
  const [target] = await pool.query("SELECT role FROM users WHERE id=? AND role IN ('manager','agent')", [id]);
  if (!target.length) return json({ error: 'Only manager and agent accounts can be deleted.' }, { status: 400 });
  await pool.query('DELETE FROM users WHERE id=?', [id]);
  return json({ deleted: true, id: Number(id) });
}