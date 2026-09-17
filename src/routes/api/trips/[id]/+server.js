import { json } from '@sveltejs/kit';
import { getPool } from '$lib/server/db.js';

export async function PUT(event) {
  const id = event.params.id;
  const body = await event.request.json();
  const pool = getPool();
  await pool.query(
    'UPDATE trips SET name=?, destination=?, start_date=?, end_date=?, status=? WHERE id=?',
    [body.name, body.destination, body.startDate || null, body.endDate || null, body.status, id]
  );
  return json({ id, ...body });
}

export async function DELETE(event) {
  const id = event.params.id;
  const pool = getPool();
  await pool.query('DELETE FROM trips WHERE id=?', [id]);
  return json({ deleted: true, id });
}
