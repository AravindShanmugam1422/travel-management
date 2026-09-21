import { json } from '@sveltejs/kit';
import { getPool } from '$lib/server/db.js';
import { hashPassword } from '$lib/server/auth.js';

export async function POST(event) {
  const { username, newPassword } = await event.request.json();
  if (!username || !newPassword || newPassword.length < 6) {
    return json({ error: 'Username and a password of at least 6 characters are required.' }, { status: 400 });
  }
  const pool = getPool();
  const [users] = await pool.query('SELECT id FROM users WHERE username=?', [username]);
  if (!users.length) return json({ error: 'Account not found.' }, { status: 404 });
  await pool.query('UPDATE users SET password=? WHERE id=?', [hashPassword(newPassword), users[0].id]);
  return json({ ok: true });
}