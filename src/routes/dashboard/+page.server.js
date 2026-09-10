import { pool } from '$lib/server/db.js';

export async function load({ locals }) {
	const agentId = locals.agent.id;

	const [[clientCount]] = await pool.query(
		'SELECT COUNT(*) AS n FROM clients WHERE agent_id = ?',
		[agentId]
	);
	const [[tripCount]] = await pool.query('SELECT COUNT(*) AS n FROM trips WHERE agent_id = ?', [
		agentId
	]);
	const [[bookingSum]] = await pool.query(
		`SELECT COALESCE(SUM(amount_in_base_currency), 0) AS total
		 FROM bookings WHERE agent_id = ?`,
		[agentId]
	);
	const [recentTrips] = await pool.query(
		`SELECT trips.id, trips.trip_name, trips.status, clients.name AS client_name
		 FROM trips JOIN clients ON clients.id = trips.client_id
		 WHERE trips.agent_id = ? ORDER BY trips.created_at DESC LIMIT 5`,
		[agentId]
	);

	return {
		stats: {
			clients: clientCount.n,
			trips: tripCount.n,
			totalBookedINR: Number(bookingSum.total)
		},
		recentTrips
	};
}
