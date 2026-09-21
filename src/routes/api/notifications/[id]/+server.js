import { json } from '@sveltejs/kit';
import { getPool } from '$lib/server/db.js';

export async function PUT(event) {
  const { text, time, kind = 'reminder' } = await event.request.json();
  const id = event.params.id;
  if (!text?.trim()) return json({ error: 'Reminder text is required.' }, { status: 400 });

  const pool = getPool();
  const safeKind = kind === 'notification' ? 'notification' : 'reminder';
  let result;
  try {
    [result] = await pool.query('UPDATE notifications SET text=?, time=?, kind=? WHERE id=?', [text.trim(), time || 'Just now', safeKind, id]);
  } catch (error) {
    if (!error.message?.includes("Unknown column 'kind'")) throw error;
    [result] = await pool.query('UPDATE notifications SET text=?, time=? WHERE id=?', [text.trim(), time || 'Just now', id]);
  }
  if (!result.affectedRows) return json({ error: 'Reminder not found.' }, { status: 404 });
  return json({ id: Number(id), text: text.trim(), time: time || 'Just now', kind: safeKind });
}

export async function DELETE(event) {
  const pool = getPool();
  const [result] = await pool.query('DELETE FROM notifications WHERE id=?', [event.params.id]);
  if (!result.affectedRows) return json({ error: 'Reminder not found.' }, { status: 404 });
  return json({ ok: true });
}
