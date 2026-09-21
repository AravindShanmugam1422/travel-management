import { json } from '@sveltejs/kit';
import { getPool } from '$lib/server/db.js';
import { hashPassword } from '$lib/server/auth.js';

export async function POST(event) {
  const { name, username, password } = await event.request.json();
  const pool = getPool();
  const creatorId = Number(event.request.headers.get('x-user-id')) || null;
  const creatorRole = event.request.headers.get('x-user-role');
  const [existing] = await pool.query('SELECT id FROM users WHERE username=?', [username]);
  if (existing.length) {
    return json({ error: 'Username already exists.' }, { status: 400 });
  }
  const hashed = hashPassword(password);
  await pool.query('INSERT INTO users (name, username, password, role, manager_id) VALUES (?,?,?,\'agent\',?)', [name, username, hashed, creatorRole === 'manager' ? creatorId : null]);
  return json({ ok: true });
}
