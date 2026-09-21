import { json } from '@sveltejs/kit';
import { getPool } from '$lib/server/db.js';
import { crudDelete } from '$lib/server/crud.js';

export async function PUT(event) {
	const body = await event.request.json();
	const pool = getPool();
	await pool.query('UPDATE expenses SET client_name=?, trip_name=?, purpose=?, method=?, amount=?, date=?, status=?, proof=? WHERE id=?', [body.clientName || null, body.tripName || null, body.purpose, body.method, body.amount, body.date || null, body.status, body.proof || null, event.params.id]);
	return json({ id: event.params.id, ...body });
}

export const DELETE = (event) => crudDelete(event, 'expenses');
