import { json } from '@sveltejs/kit';
import { getPool } from '$lib/server/db.js';

export async function PUT(event) {
  const id = event.params.id;
  const body = await event.request.json();
  const pool = getPool();
  await pool.query(
    'UPDATE bookings SET client_name=?, trip_name=?, travel_date=?, status=?, amount=? WHERE id=?',
    [body.clientName, body.tripName, body.travelDate || null, body.status, Number(body.amount || 0), id]
  );
  return json({ id, ...body });
}

export async function DELETE(event) {
  const id = event.params.id;
  const pool = getPool();
  await pool.query('DELETE FROM bookings WHERE id=?', [id]);
  return json({ deleted: true, id });
}
