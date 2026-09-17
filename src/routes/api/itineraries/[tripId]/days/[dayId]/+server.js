import { json } from '@sveltejs/kit';
import { getPool } from '$lib/server/db.js';

export async function DELETE(event) {
  const dayId = event.params.dayId;
  const pool = getPool();
  await pool.query('DELETE FROM itinerary_days WHERE id=?', [dayId]);
  return json({ deleted: true });
}
