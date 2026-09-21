import { json } from '@sveltejs/kit';
import { getPool } from '$lib/server/db.js';

export async function GET() {
  const pool = getPool();
  let rows;
  try {
    [rows] = await pool.query("SELECT * FROM notifications WHERE LOWER(text) NOT LIKE '%logged in%' ORDER BY created_at DESC LIMIT 20");
  } catch (error) {
    if (!error.message?.includes("Unknown column 'kind'")) throw error;
    [rows] = await pool.query("SELECT id, text, time, created_at FROM notifications WHERE LOWER(text) NOT LIKE '%logged in%' ORDER BY created_at DESC LIMIT 20");
    rows = rows.map((row) => ({ ...row, kind: 'notification' }));
  }
  return json(rows);
}

export async function POST(event) {
  const { text, time, kind = 'notification' } = await event.request.json();
  const pool = getPool();
  const safeKind = kind === 'reminder' ? 'reminder' : 'notification';
  let res;
  try {
    [res] = await pool.query('INSERT INTO notifications (text, time, kind) VALUES (?,?,?)', [text, time || 'Just now', safeKind]);
  } catch (error) {
    if (!error.message?.includes("Unknown column 'kind'")) throw error;
    [res] = await pool.query('INSERT INTO notifications (text, time) VALUES (?,?)', [text, time || 'Just now']);
  }
  return json({ id: res.insertId, text, time: time || 'Just now', kind: safeKind });
}

export async function DELETE({ url }) {
  const kind = url.searchParams.get('kind') || 'notification';
  const pool = getPool();
  try {
    await pool.query('DELETE FROM notifications WHERE kind=?', [kind === 'reminder' ? 'reminder' : 'notification']);
  } catch (error) {
    if (!error.message?.includes("Unknown column 'kind'")) throw error;
    await pool.query('DELETE FROM notifications');
  }
  return json({ ok: true });
}
