import { json } from '@sveltejs/kit';
import { getPool } from '$lib/server/db.js';

export async function POST(event) {
  const dayId = event.params.dayId;
  const { time, text } = await event.request.json();
  const pool = getPool();
  const [res] = await pool.query('INSERT INTO itinerary_items (day_id, time, text) VALUES (?,?,?)', [dayId, time, text]);
  return json({ id: res.insertId, time, text });
}
