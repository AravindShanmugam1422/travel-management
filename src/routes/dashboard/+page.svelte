<script>
	let { data } = $props();
</script>

<svelte:head><title>Overview — Travel Desk</title></svelte:head>

<div class="page">
	<h1>Overview</h1>

	<div class="field-row">
		<div class="card" style="flex:1;">
			<div style="color:var(--muted);font-size:0.82rem;">Clients</div>
			<div style="font-family:var(--font-display);font-size:2rem;">{data.stats.clients}</div>
		</div>
		<div class="card" style="flex:1;">
			<div style="color:var(--muted);font-size:0.82rem;">Trips</div>
			<div style="font-family:var(--font-display);font-size:2rem;">{data.stats.trips}</div>
		</div>
		<div class="card" style="flex:1;">
			<div style="color:var(--muted);font-size:0.82rem;">Total booked (INR)</div>
			<div style="font-family:var(--font-display);font-size:2rem;">
				₹{data.stats.totalBookedINR.toLocaleString('en-IN')}
			</div>
		</div>
	</div>

	<div class="card">
		<h3>Recent trips</h3>
		{#if data.recentTrips.length === 0}
			<div class="empty">No trips created yet. <a href="/dashboard/clients">Add a client</a> first.</div>
		{:else}
			<table>
				<thead>
					<tr><th>Trip</th><th>Client</th><th>Status</th></tr>
				</thead>
				<tbody>
					{#each data.recentTrips as trip}
						<tr>
							<td><a href="/dashboard/trips/{trip.id}">{trip.trip_name}</a></td>
							<td>{trip.client_name}</td>
							<td><span class="stamp stamp-teal">{trip.status}</span></td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>
