import { fail } from '@sveltejs/kit';
import { pool } from '$lib/server/db.js';

export async function load({ locals }) {
	const [clients] = await pool.query(
		'SELECT * FROM clients WHERE agent_id = ? ORDER BY created_at DESC',
		[locals.agent.id]
	);
	return { clients };
}

export const actions = {
	addClient: async ({ request, locals }) => {
		const form = await request.formData();
		const name = form.get('name')?.toString().trim();
		const phone = form.get('phone')?.toString().trim() || null;
		const email = form.get('email')?.toString().trim() || null;
		const notes = form.get('notes')?.toString().trim() || null;

		if (!name) return fail(400, { error: 'Client name is required.' });

		await pool.query(
			'INSERT INTO clients (agent_id, name, phone, email, notes) VALUES (?, ?, ?, ?, ?)',
			[locals.agent.id, name, phone, email, notes]
		);
		return { success: true };
	},

	updateClient: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id')?.toString();
		const name = form.get('name')?.toString().trim();
		const phone = form.get('phone')?.toString().trim() || null;
		const email = form.get('email')?.toString().trim() || null;
		const notes = form.get('notes')?.toString().trim() || null;

		if (!name) return fail(400, { error: 'Client name is required.' });

		await pool.query(
			'UPDATE clients SET name = ?, phone = ?, email = ?, notes = ? WHERE id = ? AND agent_id = ?',
			[name, phone, email, notes, id, locals.agent.id]
		);
		return { success: true };
	},

	deleteClient: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id')?.toString();
		await pool.query('DELETE FROM clients WHERE id = ? AND agent_id = ?', [id, locals.agent.id]);
		return { success: true };
	}
};
