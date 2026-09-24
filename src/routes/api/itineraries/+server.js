import { json } from '@sveltejs/kit';
import { getPool } from '$lib/server/db.js';

export async function GET() {
  const pool = getPool();
  const [itins] = await pool.query('SELECT * FROM itineraries');
  const [days] = await pool.query('SELECT * FROM itinerary_days ORDER BY day_order ASC, id ASC');
  const [items] = await pool.query('SELECT * FROM itinerary_items ORDER BY id ASC');

  const result = {};
  for (const it of itins) {
    result[it.trip_id] = { tripName: it.trip_name, days: [] };
  }
  const dayMap = {};
  for (const d of days) {
    if (!result[d.trip_id]) continue;
    const dayObj = { id: d.id, label: d.label, items: [] };
    dayMap[d.id] = dayObj;
    result[d.trip_id].days.push(dayObj);
  }
  for (const it of items) {
    const d = dayMap[it.day_id];
    if (d) d.items.push({ id: it.id, time: it.time, text: it.text, status: it.status });
  }
  return json(result);
}

export async function POST(event) {
  const { tripId, tripName } = await event.request.json();
  const pool = getPool();
  await pool.query('INSERT IGNORE INTO itineraries (trip_id, trip_name) VALUES (?,?)', [tripId, tripName]);
  return json({ tripId, tripName });
}