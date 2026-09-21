import { json } from '@sveltejs/kit';
import { getPool } from '$lib/server/db.js';
import { nextId } from '$lib/server/crud.js';

export async function GET() {
	const pool = getPool();
	const [rows] = await pool.query('SELECT * FROM expenses ORDER BY created_at DESC');
	return json(rows.map(toApi));
}

function toApi(row) {
	return { id: row.id, clientName: row.client_name || '', tripName: row.trip_name || '', purpose: row.purpose, method: row.method, amount: row.amount, date: row.date, status: row.status, proof: row.proof };
}

export async function POST(event) {
	const body = await event.request.json();
	const pool = getPool();
	const id = await nextId('expenses', 'EXP');
	await pool.query('INSERT INTO expenses (id, client_name, trip_name, purpose, method, amount, date, status, proof) VALUES (?,?,?,?,?,?,?,?,?)', [id, body.clientName || null, body.tripName || null, body.purpose, body.method, body.amount, body.date || null, body.status, body.proof || null]);
	return json({ id, ...body });
}
