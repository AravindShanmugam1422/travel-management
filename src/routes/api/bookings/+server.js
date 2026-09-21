import { json } from '@sveltejs/kit';
import { getPool } from '$lib/server/db.js';
import { nextId } from '$lib/server/crud.js';
import { accessScope } from '$lib/server/access.js';

function toApi(row) {
  return { id: row.id, clientName: row.client_name, tripName: row.trip_name, travelDate: row.travel_date, status: row.status, amount: row.amount, assignedAgentId: row.assigned_agent_id, assignedAgentName: row.assigned_agent_name };
}

export async function GET(event) {
  const pool = getPool();
  const scope = await accessScope(event, 'bookings.assigned_agent_id');
  let rows;
  try {
    [rows] = await pool.query(`SELECT bookings.*, users.name AS assigned_agent_name FROM bookings LEFT JOIN users ON users.id = bookings.assigned_agent_id${scope.clause} ORDER BY bookings.created_at DESC`, scope.params);
  } catch (error) {
    if (!error.message?.includes('Unknown column')) throw error;
    [rows] = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
  }
  return json(rows.map(toApi));
}

export async function POST(event) {
  const body = await event.request.json();
  const pool = getPool();
  const userId = Number(event.request.headers.get('x-user-id'));
  const userRole = event.request.headers.get('x-user-role');
  const id = await nextId('bookings', 'BKG');
  try {
    await pool.query('INSERT INTO bookings (id, client_name, trip_name, travel_date, status, amount, assigned_agent_id) VALUES (?,?,?,?,?,?,?)', [id, body.clientName, body.tripName, body.travelDate || null, body.status, Number(body.amount || 0), userRole === 'agent' ? userId : body.assignedAgentId || null]);
  } catch (error) {
    if (!error.message?.includes('Unknown column')) throw error;
    await pool.query('INSERT INTO bookings (id, client_name, trip_name, travel_date, status, amount) VALUES (?,?,?,?,?,?)', [id, body.clientName, body.tripName, body.travelDate || null, body.status, Number(body.amount || 0)]);
  }
  return json({ id, ...body });
}
