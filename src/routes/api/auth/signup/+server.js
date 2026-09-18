import { json } from '@sveltejs/kit';
import { getPool } from '$lib/server/db.js';
import { hashPassword } from '$lib/server/auth.js';

export async function POST(event) {
  const { name, username, password } = await event.request.json();
  const pool = getPool();

  const [[{ c: headCount }]] = await pool.query("SELECT COUNT(*) as c FROM users WHERE role='head_office'");
  const [[{ c: mgrCount }]] = await pool.query("SELECT COUNT(*) as c FROM users WHERE role='manager'");
  const role = mgrCount < 1 ? 'manager' : headCount < 2 ? 'head_office' : null;
  if (!role) return json({ error: 'All self-signup account slots are full. Ask an admin to create an account.' }, { status: 400 });
  const [existing] = await pool.query('SELECT id FROM users WHERE username=?', [username]);
  if (existing.length) {
    return json({ error: 'Username already taken.' }, { status: 400 });
  }
  const hashed = hashPassword(password);
  await pool.query('INSERT INTO users (name, username, password, role) VALUES (?,?,?,?)', [name, username, hashed, role]);
  return json({ ok: true });
}
