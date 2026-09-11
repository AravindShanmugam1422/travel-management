<script>
	import { enhance } from '$app/forms';
	let { data } = $props();
</script>

<svelte:head><title>Trips — Travel Desk</title></svelte:head>

<div class="page">
	<h1>Trips</h1>
	<p style="color:var(--muted);">Create new trips from a client's page.</p>

	<div class="card">
		{#if data.trips.length === 0}
			<div class="empty">No trips yet. <a href="/dashboard/clients">Go to a client</a> to create one.</div>
		{:else}
			<table>
				<thead><tr><th>Trip</th><th>Client</th><th>Dates</th><th>Status</th><th></th></tr></thead>
				<tbody>
					{#each data.trips as trip}
						<tr>
							<td><a href="/dashboard/trips/{trip.id}">{trip.trip_name}</a></td>
							<td>{trip.client_name}</td>
							<td>
								{trip.start_date ? new Date(trip.start_date).toLocaleDateString('en-IN') : '—'}
								{#if trip.end_date} → {new Date(trip.end_date).toLocaleDateString('en-IN')}{/if}
							</td>
							<td><span class="stamp stamp-teal">{trip.status}</span></td>
							<td>
								<form
									method="POST"
									action="?/deleteTrip"
									use:enhance
									onsubmit={(e) => {
										if (!confirm(`Delete trip "${trip.trip_name}"? This also deletes its itinerary and bookings.`)) {
											e.preventDefault();
										}
									}}
								>
									<input type="hidden" name="id" value={trip.id} />
									<button class="btn btn-danger" style="padding:0.3rem 0.7rem;font-size:0.8rem;" type="submit">Delete</button>
								</form>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>
