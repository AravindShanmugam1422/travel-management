import crypto from 'node:crypto';
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

export async function GET(event) {
  if (event.request.headers.get('x-user-role') !== 'head_office') return json({ error: 'Only Head Office can view reset requests.' }, { status: 403 });
  const pool = getPool(); await ensureTable(pool);
  const [rows] = await pool.query("SELECT r.id, r.username, r.status, r.expires_at AS expiresAt, r.created_at AS createdAt, u.name, u.role FROM password_reset_requests r JOIN users u ON u.id=r.user_id ORDER BY r.created_at DESC LIMIT 30");
  return json(rows);
}

export async function PUT(event) {
  if (event.request.headers.get('x-user-role') !== 'head_office') return json({ error: 'Only Head Office can approve reset requests.' }, { status: 403 });
  const pool = getPool(); await ensureTable(pool);
  const { action, requestId } = await event.request.json();
  const id = requestId;
  if (action === 'reject') { await pool.query("UPDATE password_reset_requests SET status='rejected' WHERE id=? AND status='pending'", [id]); return json({ ok: true }); }
  const temporaryPassword = crypto.randomBytes(5).toString('hex');
  const [result] = await pool.query("UPDATE password_reset_requests SET status='approved', temporary_password_hash=?, expires_at=DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id=? AND status='pending'", [hashPassword(temporaryPassword), id]);
  if (!result.affectedRows) return json({ error: 'Pending request not found.' }, { status: 404 });
  return json({ ok: true, temporaryPassword, expiresIn: '15 minutes' });
}