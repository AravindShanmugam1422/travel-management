import { json } from '@sveltejs/kit';
import { getPool } from '$lib/server/db.js';
import { hashPassword } from '$lib/server/auth.js';

async function ensureTable(pool) {
  await pool.query(`CREATE TABLE IF NOT EXISTS password_reset_requests (
    id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, username VARCHAR(100) NOT NULL,
    status ENUM('pending','approved','rejected','used') NOT NULL DEFAULT 'pending',
    temporary_password_hash VARCHAR(255), expires_at DATETIME, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
}

export async function POST(event) {
  const { username, newPassword, confirmPassword, requestId } = await event.request.json();
  if (!username) return json({ error: 'Username is required.' }, { status: 400 });
  const pool = getPool();
  await ensureTable(pool);
  if (!requestId) {
    const [users] = await pool.query('SELECT id FROM users WHERE username=?', [username]);
    if (users.length) {
      await pool.query("INSERT INTO password_reset_requests (user_id, username) SELECT ?, ? FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM password_reset_requests WHERE user_id=? AND status='pending')", [users[0].id, username, users[0].id]);
    }
    return json({ ok: true, message: 'If the account exists, an admin approval request has been created.' });
  }
  if (!newPassword || newPassword.length < 6 || newPassword !== confirmPassword) return json({ error: 'Matching password of at least 6 characters is required.' }, { status: 400 });
  const [requests] = await pool.query("SELECT * FROM password_reset_requests WHERE id=? AND username=? AND status='approved' AND expires_at > NOW()", [requestId, username]);
  if (!requests.length) return json({ error: 'This reset approval is invalid or expired.' }, { status: 400 });
  await pool.query('UPDATE users SET password=? WHERE id=?', [hashPassword(newPassword), requests[0].user_id]);
  await pool.query("UPDATE password_reset_requests SET status='used' WHERE id=?", [requestId]);
  return json({ ok: true });
}