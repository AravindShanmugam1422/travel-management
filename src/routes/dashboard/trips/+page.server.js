import { pool } from '$lib/server/db.js';

export async function load({ locals }) {
	const [trips] = await pool.query(
		`SELECT trips.*, clients.name AS client_name
		 FROM trips JOIN clients ON clients.id = trips.client_id
		 WHERE trips.agent_id = ? ORDER BY trips.created_at DESC`,
		[locals.agent.id]
	);
	return { trips };
}
