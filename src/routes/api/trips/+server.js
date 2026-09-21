import { json } from '@sveltejs/kit';
import { getPool } from '$lib/server/db.js';
import { nextId } from '$lib/server/crud.js';
import { accessScope } from '$lib/server/access.js';

function dateOnly(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

function toApi(row) {
  return { id: row.id, name: row.name, destination: row.destination, startDate: dateOnly(row.start_date), endDate: dateOnly(row.end_date), status: row.status, assignedAgentId: row.assigned_agent_id, assignedAgentName: row.assigned_agent_name };
}

export async function GET(event) {
  const pool = getPool();
  const scope = await accessScope(event, 'trips.assigned_agent_id');
  const [rows] = await pool.query(`SELECT trips.*, users.name AS assigned_agent_name FROM trips LEFT JOIN users ON users.id = trips.assigned_agent_id${scope.clause} ORDER BY trips.created_at DESC`, scope.params);
  return json(rows.map(toApi));
}

export async function POST(event) {
  const body = await event.request.json();
  const pool = getPool();
  const userId = Number(event.request.headers.get('x-user-id'));
  const userRole = event.request.headers.get('x-user-role');
  const id = await nextId('trips', 'TR');
  await pool.query(
    'INSERT INTO trips (id, name, destination, start_date, end_date, status, assigned_agent_id) VALUES (?,?,?,?,?,?,?)',
    [id, body.name, body.destination, body.startDate || null, body.endDate || null, body.status, userRole === 'agent' ? userId : body.assignedAgentId || null]
  );
  return json({ id, ...body });
}
