<script>
	import { enhance } from '$app/forms';
	let { data, form } = $props();
	let showItemForm = $state(false);
	let showBookingForm = $state(false);

	const statuses = ['Planned', 'Confirmed', 'Ongoing', 'Completed', 'Cancelled'];
</script>

<svelte:head><title>{data.trip.trip_name} — Travel Desk</title></svelte:head>

<div class="page">
	<a href="/dashboard/clients/{data.trip.client_id}">← {data.trip.client_name}</a>
	<div style="display:flex;justify-content:space-between;align-items:center;">
		<h1>{data.trip.trip_name}</h1>
		<form method="POST" action="?/updateStatus" use:enhance>
			<select name="status" onchange={(e) => e.target.form.requestSubmit()}>
				{#each statuses as s}
					<option value={s} selected={s === data.trip.status}>{s}</option>
				{/each}
			</select>
		</form>
	</div>

	{#if form?.error}<div class="error-box">{form.error}</div>{/if}

	<div class="card">
		<div style="display:flex;justify-content:space-between;align-items:center;">
			<h3>Itinerary</h3>
			<button class="btn btn-secondary" onclick={() => (showItemForm = !showItemForm)}>
				{showItemForm ? 'Cancel' : '+ Add item'}
			</button>
		</div>

		{#if showItemForm}
			<form
				method="POST"
				action="?/addItineraryItem"
				use:enhance={() => async ({ update }) => { await update(); showItemForm = false; }}
			>
				<div class="field-row">
					<div class="field">
						<label for="day_number">Day</label>
						<input id="day_number" name="day_number" type="number" min="1" required />
					</div>
					<div class="field">
						<label for="item_time">Time</label>
						<input id="item_time" name="item_time" type="time" />
					</div>
				</div>
				<div class="field">
					<label for="description">Description</label>
					<input id="description" name="description" required placeholder="e.g. Airport transfer to hotel" />
				</div>
				<button class="btn btn-primary" type="submit">Save item</button>
			</form>
		{/if}

		{#if data.itineraryItems.length === 0}
			<div class="empty">No itinerary items yet.</div>
		{:else}
			<table>
				<thead><tr><th>Day</th><th>Time</th><th>Description</th></tr></thead>
				<tbody>
					{#each data.itineraryItems as item}
						<tr>
							<td>Day {item.day_number}</td>
							<td>{item.item_time || '—'}</td>
							<td>{item.description}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>

	<div class="card">
		<div style="display:flex;justify-content:space-between;align-items:center;">
			<h3>Bookings</h3>
			<button class="btn btn-secondary" onclick={() => (showBookingForm = !showBookingForm)}>
				{showBookingForm ? 'Cancel' : '+ Add booking'}
			</button>
		</div>

		{#if showBookingForm}
			{#if data.itineraryItems.length === 0}
				<div class="empty">Add an itinerary item first before adding a booking.</div>
			{:else if data.suppliers.length === 0}
				<div class="empty">Add a <a href="/dashboard/suppliers">supplier</a> first before adding a booking.</div>
			{:else}
				<form
					method="POST"
					action="?/addBooking"
					use:enhance={() => async ({ update }) => { await update(); showBookingForm = false; }}
				>
					<div class="field-row">
						<div class="field">
							<label for="itinerary_item_id">Itinerary item</label>
							<select id="itinerary_item_id" name="itinerary_item_id" required>
								{#each data.itineraryItems as item}
									<option value={item.id}>Day {item.day_number} — {item.description}</option>
								{/each}
							</select>
						</div>
						<div class="field">
							<label for="supplier_id">Supplier</label>
							<select id="supplier_id" name="supplier_id" required>
								{#each data.suppliers as s}
									<option value={s.id}>{s.name}</option>
								{/each}
							</select>
						</div>
					</div>
					<div class="field">
						<label for="booking_reference">Booking reference</label>
						<input id="booking_reference" name="booking_reference" />
					</div>
					<div class="field-row">
						<div class="field">
							<label for="amount">Amount</label>
							<input id="amount" name="amount" type="number" step="0.01" required />
						</div>
						<div class="field">
							<label for="currency">Currency</label>
							<input id="currency" name="currency" value="INR" style="max-width:100px;" />
						</div>
						<div class="field">
							<label for="commission_amount">Commission amount</label>
							<input id="commission_amount" name="commission_amount" type="number" step="0.01" value="0" />
						</div>
					</div>
					<p style="color:var(--muted);font-size:0.82rem;margin-top:-0.4rem;">
						Currency INR illana, live forex rate automatic ah fetch aagi INR ku convert pannum.
					</p>
					<div class="field-row">
						<div class="field">
							<label for="paid_by">Paid by</label>
							<select id="paid_by" name="paid_by">
								<option>Client</option>
								<option>Agent</option>
								<option>Head Office</option>
							</select>
						</div>
						<div class="field">
							<label for="payment_date">Payment date</label>
							<input id="payment_date" name="payment_date" type="date" />
						</div>
					</div>
					<div class="field-row">
						<div class="field">
							<label for="supplier_confirmation">Supplier confirmation</label>
							<input id="supplier_confirmation" name="supplier_confirmation" />
						</div>
						<div class="field">
							<label for="operator_confirmation">Operator confirmation</label>
							<input id="operator_confirmation" name="operator_confirmation" />
						</div>
					</div>
					<button class="btn btn-primary" type="submit">Add booking</button>
				</form>
			{/if}
		{/if}

		{#if data.bookings.length === 0}
			<div class="empty">Bookings Not yet.</div>
		{:else}
			<table>
				<thead>
					<tr><th>Item</th><th>Supplier</th><th>Amount</th><th>In INR</th><th>Commission</th><th>Paid by</th></tr>
				</thead>
				<tbody>
					{#each data.bookings as b}
						<tr>
							<td>{b.item_description}</td>
							<td>{b.supplier_name}</td>
							<td>{b.amount} {b.currency}</td>
							<td>₹{Number(b.amount_in_base_currency).toLocaleString('en-IN')}</td>
							<td>{b.commission_amount}</td>
							<td><span class="stamp stamp-brass">{b.paid_by}</span></td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>
