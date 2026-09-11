<script>
	import { enhance } from '$app/forms';
	let { data, form } = $props();
	let showForm = $state(false);
	let editingClient = $state(null);
</script>

<svelte:head><title>Clients — Travel Desk</title></svelte:head>

<div class="page">
	<div style="display:flex;justify-content:space-between;align-items:center;">
		<h1>Clients</h1>
		<button class="btn btn-primary" onclick={() => { showForm = !showForm; editingClient = null; }}>
			{showForm ? 'Cancel' : '+ Add client'}
		</button>
	</div>

	{#if form?.error}<div class="error-box">{form.error}</div>{/if}

	{#if showForm}
		<div class="card">
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

	{#if editingClient}
		<div class="card">
			<h3>Edit client</h3>
			<form
				method="POST"
				action="?/updateClient"
				use:enhance={() => async ({ update }) => { await update(); editingClient = null; }}
			>
				<input type="hidden" name="id" value={editingClient.id} />
				<div class="field-row">
					<div class="field">
						<label for="edit_name">Name</label>
						<input id="edit_name" name="name" required value={editingClient.name} />
					</div>
					<div class="field">
						<label for="edit_phone">Phone</label>
						<input id="edit_phone" name="phone" value={editingClient.phone ?? ''} />
					</div>
				</div>
				<div class="field-row">
					<div class="field">
						<label for="edit_email">Email</label>
						<input id="edit_email" name="email" type="email" value={editingClient.email ?? ''} />
					</div>
				</div>
				<div class="field">
					<label for="edit_notes">Notes</label>
					<textarea id="edit_notes" name="notes" rows="2">{editingClient.notes ?? ''}</textarea>
				</div>
				<div style="display:flex;gap:0.6rem;">
					<button class="btn btn-primary" type="submit">Save changes</button>
					<button class="btn btn-secondary" type="button" onclick={() => (editingClient = null)}>Cancel</button>
				</div>
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
							<td style="white-space:nowrap;">
								<button
									class="btn btn-secondary"
									style="padding:0.3rem 0.7rem;font-size:0.8rem;"
									onclick={() => { editingClient = client; showForm = false; }}
								>Edit</button>
								<form
									method="POST"
									action="?/deleteClient"
									style="display:inline;"
									use:enhance
									onsubmit={(e) => {
										if (!confirm(`Delete client "${client.name}"? This also deletes their passengers and trips.`)) {
											e.preventDefault();
										}
									}}
								>
									<input type="hidden" name="id" value={client.id} />
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
