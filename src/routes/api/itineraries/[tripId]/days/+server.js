import { json } from '@sveltejs/kit';
import { getPool } from '$lib/server/db.js';

export async function POST(event) {
  const tripId = event.params.tripId;
  const { label } = await event.request.json();
  const pool = getPool();
  const [[{ c }]] = await pool.query('SELECT COUNT(*) as c FROM itinerary_days WHERE trip_id=?', [tripId]);
  const [res] = await pool.query('INSERT INTO itinerary_days (trip_id, label, day_order) VALUES (?,?,?)', [tripId, label, c + 1]);
  return json({ id: res.insertId, label, items: [] });
}
