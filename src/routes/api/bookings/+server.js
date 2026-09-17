import { json } from '@sveltejs/kit';
import { getPool } from '$lib/server/db.js';
import { nextId } from '$lib/server/crud.js';

function toApi(row) {
  return { id: row.id, clientName: row.client_name, tripName: row.trip_name, travelDate: row.travel_date, status: row.status, amount: row.amount };
}

export async function GET() {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
  return json(rows.map(toApi));
}

export async function POST(event) {
  const body = await event.request.json();
  const pool = getPool();
  const id = await nextId('bookings', 'BKG');
  await pool.query(
    'INSERT INTO bookings (id, client_name, trip_name, travel_date, status, amount) VALUES (?,?,?,?,?,?)',
    [id, body.clientName, body.tripName, body.travelDate || null, body.status, Number(body.amount || 0)]
  );
  return json({ id, ...body });
}
