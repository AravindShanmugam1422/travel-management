<script>
	import { enhance } from '$app/forms';
	let { data, form } = $props();
	let showPassengerForm = $state(false);
	let showTripForm = $state(false);
</script>

<svelte:head><title>{data.client.name} — Travel Desk</title></svelte:head>

<div class="page">
	<a href="/dashboard/clients">← All clients</a>
	<h1>{data.client.name}</h1>
	<p style="color:var(--muted);">
		{data.client.phone || 'No phone'} · {data.client.email || 'No email'}
	</p>
	{#if data.client.notes}<p>{data.client.notes}</p>{/if}

	{#if form?.error}<div class="error-box">{form.error}</div>{/if}

	<div class="card">
		<div style="display:flex;justify-content:space-between;align-items:center;">
			<h3>Passengers</h3>
			<button class="btn btn-secondary" onclick={() => (showPassengerForm = !showPassengerForm)}>
				{showPassengerForm ? 'Cancel' : '+ Add passenger'}
			</button>
		</div>

		{#if showPassengerForm}
			<form
				method="POST"
				action="?/addPassenger"
				use:enhance={() => async ({ update }) => { await update(); showPassengerForm = false; }}
			>
				<div class="field-row">
					<div class="field">
						<label for="full_name">Full name</label>
						<input id="full_name" name="full_name" required />
					</div>
					<div class="field">
						<label for="date_of_birth">Date of birth</label>
						<input id="date_of_birth" name="date_of_birth" type="date" />
					</div>
				</div>
				<button class="btn btn-primary" type="submit">Save passenger</button>
			</form>
		{/if}

		{#if data.passengers.length === 0}
			<div class="empty">No passengers added yet</div>
		{:else}
			<table>
				<thead><tr><th>Name</th><th>DOB</th></tr></thead>
				<tbody>
					{#each data.passengers as p}
						<tr><td>{p.full_name}</td><td>{p.date_of_birth ? new Date(p.date_of_birth).toLocaleDateString('en-IN') : '—'}</td></tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>

	<div class="card">
		<div style="display:flex;justify-content:space-between;align-items:center;">
			<h3>Trips</h3>
			<button class="btn btn-secondary" onclick={() => (showTripForm = !showTripForm)}>
				{showTripForm ? 'Cancel' : '+ New trip'}
			</button>
		</div>

		{#if showTripForm}
			<form method="POST" action="?/addTrip" use:enhance>
				<div class="field">
					<label for="trip_name">Trip name</label>
					<input id="trip_name" name="trip_name" required placeholder="e.g. Bali Honeymoon" />
				</div>
				<div class="field-row">
					<div class="field">
						<label for="start_date">Start date</label>
						<input id="start_date" name="start_date" type="date" />
					</div>
					<div class="field">
						<label for="end_date">End date</label>
						<input id="end_date" name="end_date" type="date" />
					</div>
				</div>
				<button class="btn btn-primary" type="submit">Create trip</button>
			</form>
		{/if}

		{#if data.trips.length === 0}
			<div class="empty">Trips Not Yet.</div>
		{:else}
			<table>
				<thead><tr><th>Trip</th><th>Dates</th><th>Status</th></tr></thead>
				<tbody>
					{#each data.trips as trip}
						<tr>
							<td><a href="/dashboard/trips/{trip.id}">{trip.trip_name}</a></td>
							<td>{trip.start_date ? new Date(trip.start_date).toLocaleDateString('en-IN') : '—'}</td>
							<td><span class="stamp stamp-teal">{trip.status}</span></td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>
