import { json } from '@sveltejs/kit';
import { getPool } from '$lib/server/db.js';

export async function GET() {
  const pool = getPool();
  const [rows] = await pool.query("SELECT * FROM notifications WHERE LOWER(text) NOT LIKE '%logged in%' ORDER BY created_at DESC LIMIT 20");
  return json(rows);
}

export async function POST(event) {
  const { text, time, kind = 'notification' } = await event.request.json();
  const pool = getPool();
  const safeKind = kind === 'reminder' ? 'reminder' : 'notification';
  const [res] = await pool.query('INSERT INTO notifications (text, time, kind) VALUES (?,?,?)', [text, time || 'Just now', safeKind]);
  return json({ id: res.insertId, text, time: time || 'Just now', kind: safeKind });
}
