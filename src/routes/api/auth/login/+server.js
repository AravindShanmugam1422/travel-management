import { json } from '@sveltejs/kit';
import { getPool } from '$lib/server/db.js';
import { verifyPassword } from '$lib/server/auth.js';

export async function POST(event) {
  const { username, password, role } = await event.request.json();
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM users WHERE username=? AND role=?', [username, role]);
  if (!rows.length || !verifyPassword(password, rows[0].password)) {
    return json({ error: 'Invalid username, password, or role.' }, { status: 401 });
  }
  const u = rows[0];
  return json({ id: u.id, name: u.name, username: u.username, role: u.role });
}
