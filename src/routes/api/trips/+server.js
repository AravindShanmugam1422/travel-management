import { json } from '@sveltejs/kit';
import { getPool } from '$lib/server/db.js';
import { nextId } from '$lib/server/crud.js';

function toApi(row) {
  return { id: row.id, name: row.name, destination: row.destination, startDate: row.start_date, endDate: row.end_date, status: row.status };
}

export async function GET() {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM trips ORDER BY created_at DESC');
  return json(rows.map(toApi));
}

export async function POST(event) {
  const body = await event.request.json();
  const pool = getPool();
  const id = await nextId('trips', 'TR');
  await pool.query(
    'INSERT INTO trips (id, name, destination, start_date, end_date, status) VALUES (?,?,?,?,?,?)',
    [id, body.name, body.destination, body.startDate || null, body.endDate || null, body.status]
  );
  return json({ id, ...body });
}
