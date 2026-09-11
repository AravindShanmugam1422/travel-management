<script>
	import { enhance } from '$app/forms';
	let { data, form } = $props();
	let showForm = $state(false);
</script>

<svelte:head><title>Clients — Travel Desk</title></svelte:head>

<div class="page">
	<div style="display:flex;justify-content:space-between;align-items:center;">
		<h1>Clients</h1>
		<button class="btn btn-primary" onclick={() => (showForm = !showForm)}>
			{showForm ? 'Cancel' : '+ Add client'}
		</button>
	</div>

	{#if showForm}
		<div class="card">
			{#if form?.error}<div class="error-box">{form.error}</div>{/if}
			<form
				method="POST"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						showForm = false;
					};
				}}
			>
				<div class="field-row">
					<div class="field">
						<label for="name">Name</label>
						<input id="name" name="name" required />
					</div>
					<div class="field">
						<label for="phone">Phone</label>
						<input id="phone" name="phone" />
					</div>
				</div>
				<div class="field-row">
					<div class="field">
						<label for="email">Email</label>
						<input id="email" name="email" type="email" />
					</div>
				</div>
				<div class="field">
					<label for="notes">Notes</label>
					<textarea id="notes" name="notes" rows="2"></textarea>
				</div>
				<button class="btn btn-primary" type="submit">Save client</button>
			</form>
		</div>
	{/if}

	<div class="card">
		{#if data.clients.length === 0}
			<div class="empty">No clients added yet.</div>
		{:else}
			<table>
				<thead><tr><th>Name</th><th>Phone</th><th>Email</th><th></th></tr></thead>
				<tbody>
					{#each data.clients as client}
						<tr>
							<td><a href="/dashboard/clients/{client.id}">{client.name}</a></td>
							<td>{client.phone || '—'}</td>
							<td>{client.email || '—'}</td>
							<td><a href="/dashboard/clients/{client.id}">View →</a></td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>
