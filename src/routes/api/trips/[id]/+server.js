import { json } from '@sveltejs/kit';
import { getPool } from '$lib/server/db.js';

function dateOnly(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

export async function PUT(event) {
  const id = event.params.id;
  const body = await event.request.json();
  const pool = getPool();
  try {
    await pool.query(
      'UPDATE trips SET name=?, destination=?, start_date=?, end_date=?, status=?, assigned_agent_id=? WHERE id=?',
      [body.name, body.destination, body.startDate || null, body.endDate || null, body.status, body.assignedAgentId || null, id]
    );
  } catch (error) {
    if (!error.message?.includes("Unknown column 'assigned_agent_id'")) throw error;
    await pool.query(
      'UPDATE trips SET name=?, destination=?, start_date=?, end_date=?, status=? WHERE id=?',
      [body.name, body.destination, body.startDate || null, body.endDate || null, body.status, id]
    );
  }
  return json({ id, ...body, startDate: dateOnly(body.startDate), endDate: dateOnly(body.endDate) });
}

export async function DELETE(event) {
  const id = event.params.id;
  const pool = getPool();
  await pool.query('DELETE FROM trips WHERE id=?', [id]);
  return json({ deleted: true, id });
}
