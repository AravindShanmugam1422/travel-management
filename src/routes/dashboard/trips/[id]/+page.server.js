import { error, fail } from '@sveltejs/kit';
import { pool } from '$lib/server/db.js';
import { getForexRateToINR } from '$lib/server/forex.js';

async function loadTrip(agentId, tripId) {
	const [rows] = await pool.query(
		`SELECT trips.*, clients.name AS client_name
		 FROM trips JOIN clients ON clients.id = trips.client_id
		 WHERE trips.id = ? AND trips.agent_id = ?`,
		[tripId, agentId]
	);
	return rows[0];
}

export async function load({ params, locals }) {
	const trip = await loadTrip(locals.agent.id, params.id);
	if (!trip) throw error(404, 'Trip not found');

	const [itineraryItems] = await pool.query(
		'SELECT * FROM itinerary_items WHERE trip_id = ? ORDER BY day_number, item_time',
		[params.id]
	);
	const [bookings] = await pool.query(
		`SELECT bookings.*, suppliers.name AS supplier_name, itinerary_items.description AS item_description
		 FROM bookings
		 JOIN suppliers ON suppliers.id = bookings.supplier_id
		 JOIN itinerary_items ON itinerary_items.id = bookings.itinerary_item_id
		 WHERE bookings.agent_id = ? AND itinerary_items.trip_id = ?
		 ORDER BY bookings.created_at DESC`,
		[locals.agent.id, params.id]
	);
	const [suppliers] = await pool.query('SELECT id, name FROM suppliers ORDER BY name');

	return { trip, itineraryItems, bookings, suppliers };
}

export const actions = {
	addItineraryItem: async ({ request, params, locals }) => {
		const trip = await loadTrip(locals.agent.id, params.id);
		if (!trip) throw error(404, 'Trip not found');

		const form = await request.formData();
		const dayNumber = Number(form.get('day_number'));
		const itemTime = form.get('item_time')?.toString() || null;
		const description = form.get('description')?.toString().trim();

		if (!dayNumber || !description) return fail(400, { error: 'Day number and description are required.' });

		await pool.query(
			'INSERT INTO itinerary_items (trip_id, day_number, item_time, description) VALUES (?, ?, ?, ?)',
			[params.id, dayNumber, itemTime, description]
		);
		return { success: true };
	},

	addBooking: async ({ request, params, locals }) => {
		const trip = await loadTrip(locals.agent.id, params.id);
		if (!trip) throw error(404, 'Trip not found');

		const form = await request.formData();
		const itineraryItemId = form.get('itinerary_item_id')?.toString();
		const supplierId = form.get('supplier_id')?.toString();
		const bookingReference = form.get('booking_reference')?.toString().trim() || null;
		const amount = Number(form.get('amount'));
		const currency = (form.get('currency')?.toString().trim() || 'INR').toUpperCase();
		const commissionAmount = Number(form.get('commission_amount') || 0);
		const paidBy = form.get('paid_by')?.toString() || 'Client';
		const paymentDate = form.get('payment_date')?.toString() || null;
		const supplierConfirmation = form.get('supplier_confirmation')?.toString().trim() || null;
		const operatorConfirmation = form.get('operator_confirmation')?.toString().trim() || null;

		if (!itineraryItemId || !supplierId || !amount) {
			return fail(400, { error: 'Itinerary item, supplier, and amount are required.' });
		}

		const forexRate = await getForexRateToINR(currency);
		const amountInBase = Math.round(amount * forexRate * 100) / 100;

		await pool.query(
			`INSERT INTO bookings
			 (itinerary_item_id, supplier_id, agent_id, booking_reference, supplier_confirmation,
			  operator_confirmation, amount, currency, forex_rate, amount_in_base_currency,
			  commission_amount, paid_by, payment_date)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				itineraryItemId,
				supplierId,
				locals.agent.id,
				bookingReference,
				supplierConfirmation,
				operatorConfirmation,
				amount,
				currency,
				forexRate,
				amountInBase,
				commissionAmount,
				paidBy,
				paymentDate
			]
		);
		return { success: true };
	},

	updateStatus: async ({ request, params, locals }) => {
		const trip = await loadTrip(locals.agent.id, params.id);
		if (!trip) throw error(404, 'Trip not found');

		const form = await request.formData();
		const status = form.get('status')?.toString();
		await pool.query('UPDATE trips SET status = ? WHERE id = ?', [status, params.id]);
		return { success: true };
	}
};
