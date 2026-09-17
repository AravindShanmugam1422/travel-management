import { json } from '@sveltejs/kit';
import { getPool } from '$lib/server/db.js';
import { hashPassword } from '$lib/server/auth.js';

export async function POST(event) {
  const { name, username, password, role } = await event.request.json();
  const pool = getPool();

  if (role === 'agent') {
    return json({ error: 'Agent accounts are created by your Manager / Head Office, not via signup.' }, { status: 400 });
  }
  const [[{ c: headCount }]] = await pool.query("SELECT COUNT(*) as c FROM users WHERE role='head_office'");
  const [[{ c: mgrCount }]] = await pool.query("SELECT COUNT(*) as c FROM users WHERE role='manager'");
  if (role === 'head_office' && headCount >= 2) {
    return json({ error: 'Head Office signups are full (max 2).' }, { status: 400 });
  }
  if (role === 'manager' && mgrCount >= 1) {
    return json({ error: 'Manager signup is full (max 1).' }, { status: 400 });
  }
  const [existing] = await pool.query('SELECT id FROM users WHERE username=?', [username]);
  if (existing.length) {
    return json({ error: 'Username already taken.' }, { status: 400 });
  }
  const hashed = hashPassword(password);
  await pool.query('INSERT INTO users (name, username, password, role) VALUES (?,?,?,?)', [name, username, hashed, role]);
  return json({ ok: true });
}
