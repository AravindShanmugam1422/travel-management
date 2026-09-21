import { json } from '@sveltejs/kit';
import { getPool } from '$lib/server/db.js';
import { verifyPassword } from '$lib/server/auth.js';

export async function POST(event) {
  const { username, password } = await event.request.json();
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM users WHERE username=?', [username]);
  if (!rows.length || !verifyPassword(password, rows[0].password)) {
    if (rows.length) {
      const [resetRequests] = await pool.query("SELECT id, temporary_password_hash FROM password_reset_requests WHERE user_id=? AND status='approved' AND expires_at > NOW() ORDER BY id DESC LIMIT 1", [rows[0].id]).catch(() => [[]]);
      if (resetRequests.length && verifyPassword(password, resetRequests[0].temporary_password_hash)) {
        const u = rows[0];
        return json({ id: u.id, name: u.name, username: u.username, role: u.role, email: u.email || '', phone: u.phone || '', avatarUrl: u.avatar_url || '', forcePasswordReset: true, resetRequestId: resetRequests[0].id });
      }
    }
    return json({ error: 'Invalid username, password, or role.' }, { status: 401 });
  }
  const u = rows[0];
  return json({ id: u.id, name: u.name, username: u.username, role: u.role, email: u.email || '', phone: u.phone || '', avatarUrl: u.avatar_url || '' });
}
