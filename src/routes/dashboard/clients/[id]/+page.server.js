import { error, fail, redirect } from '@sveltejs/kit';
import { pool } from '$lib/server/db.js';

async function loadClient(agentId, clientId) {
	const [rows] = await pool.query('SELECT * FROM clients WHERE id = ? AND agent_id = ?', [
		clientId,
		agentId
	]);
	return rows[0];
}

export async function load({ params, locals }) {
	const client = await loadClient(locals.agent.id, params.id);
	if (!client) throw error(404, 'Client not found');

	const [passengers] = await pool.query(
		'SELECT * FROM passengers WHERE client_id = ? ORDER BY id DESC',
		[params.id]
	);
	const [trips] = await pool.query(
		'SELECT * FROM trips WHERE client_id = ? ORDER BY created_at DESC',
		[params.id]
	);

	return { client, passengers, trips };
}

export const actions = {
	addPassenger: async ({ request, params, locals }) => {
		const client = await loadClient(locals.agent.id, params.id);
		if (!client) throw error(404, 'Client not found');

		const form = await request.formData();
		const fullName = form.get('full_name')?.toString().trim();
		const dob = form.get('date_of_birth')?.toString() || null;
		if (!fullName) return fail(400, { error: 'Passenger name venum.' });

		await pool.query('INSERT INTO passengers (client_id, full_name, date_of_birth) VALUES (?, ?, ?)', [
			params.id,
			fullName,
			dob
		]);
		return { success: true };
	},

	addTrip: async ({ request, params, locals }) => {
		const client = await loadClient(locals.agent.id, params.id);
		if (!client) throw error(404, 'Client not found');

		const form = await request.formData();
		const tripName = form.get('trip_name')?.toString().trim();
		const startDate = form.get('start_date')?.toString() || null;
		const endDate = form.get('end_date')?.toString() || null;
		if (!tripName) return fail(400, { error: 'Trip name venum.' });

		const [result] = await pool.query(
			'INSERT INTO trips (client_id, agent_id, trip_name, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
			[params.id, locals.agent.id, tripName, startDate, endDate]
		);
		throw redirect(303, `/dashboard/trips/${result.insertId}`);
	}
};
