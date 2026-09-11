import { fail } from '@sveltejs/kit';
import { pool } from '$lib/server/db.js';

export async function load({ locals }) {
	const [expenses] = await pool.query(
		`SELECT agent_expenses.*, trips.trip_name
		 FROM agent_expenses
		 LEFT JOIN trips ON trips.id = agent_expenses.trip_id
		 WHERE agent_expenses.agent_id = ?
		 ORDER BY agent_expenses.created_at DESC`,
		[locals.agent.id]
	);
	const [trips] = await pool.query('SELECT id, trip_name FROM trips WHERE agent_id = ? ORDER BY trip_name', [
		locals.agent.id
	]);
	return { expenses, trips };
}

export const actions = {
	addExpense: async ({ request, locals }) => {
		const form = await request.formData();
		const description = form.get('description')?.toString().trim();
		const amount = Number(form.get('amount'));
		const currency = form.get('currency')?.toString().trim() || 'INR';
		const expenseDate = form.get('expense_date')?.toString() || null;
		const tripId = form.get('trip_id')?.toString() || null;

		if (!description || !amount) return fail(400, { error: 'Description and amount are required.' });

		await pool.query(
			'INSERT INTO agent_expenses (agent_id, trip_id, description, amount, currency, expense_date) VALUES (?, ?, ?, ?, ?, ?)',
			[locals.agent.id, tripId || null, description, amount, currency, expenseDate]
		);
		return { success: true };
	},

	updateExpense: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id')?.toString();
		const description = form.get('description')?.toString().trim();
		const amount = Number(form.get('amount'));
		const currency = form.get('currency')?.toString().trim() || 'INR';
		const expenseDate = form.get('expense_date')?.toString() || null;
		const tripId = form.get('trip_id')?.toString() || null;

		if (!description || !amount) return fail(400, { error: 'Description and amount are required.' });

		await pool.query(
			'UPDATE agent_expenses SET description = ?, amount = ?, currency = ?, expense_date = ?, trip_id = ? WHERE id = ? AND agent_id = ?',
			[description, amount, currency, expenseDate, tripId || null, id, locals.agent.id]
		);
		return { success: true };
	},

	deleteExpense: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id')?.toString();
		await pool.query('DELETE FROM agent_expenses WHERE id = ? AND agent_id = ?', [id, locals.agent.id]);
		return { success: true };
	},

	toggleReimbursed: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id')?.toString();
		await pool.query(
			'UPDATE agent_expenses SET reimbursed = NOT reimbursed WHERE id = ? AND agent_id = ?',
			[id, locals.agent.id]
		);
		return { success: true };
	}
};
