import { json } from '@sveltejs/kit';
import { getPool } from '$lib/server/db.js';
import { crudCreate } from '$lib/server/crud.js';
import { accessScope } from '$lib/server/access.js';

export async function GET(event) {
	const pool = getPool();
	const scope = await accessScope(event, 'clients.assigned_agent_id');
	const [rows] = await pool.query(`SELECT clients.*, users.name AS assigned_agent_name FROM clients LEFT JOIN users ON users.id = clients.assigned_agent_id${scope.clause} ORDER BY clients.created_at DESC`, scope.params);
	return json(rows.map((row) => ({ ...row, assignedAgentId: row.assigned_agent_id, assignedAgentName: row.assigned_agent_name })));
}
export const POST = (event) => crudCreate(event, 'clients', 'CL', ['name', 'email', 'phone', 'type', 'status', 'assigned_agent_id', 'passengers']);
