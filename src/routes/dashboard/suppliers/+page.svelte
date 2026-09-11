<script>
	import { enhance } from '$app/forms';
	let { data, form } = $props();
	let showForm = $state(false);
	let editingSupplier = $state(null);
</script>

<svelte:head><title>Suppliers — Travel Desk</title></svelte:head>

<div class="page">
	<div style="display:flex;justify-content:space-between;align-items:center;">
		<h1>Suppliers</h1>
		<button class="btn btn-primary" onclick={() => { showForm = !showForm; editingSupplier = null; }}>
			{showForm ? 'Cancel' : '+ Add supplier'}
		</button>
	</div>

	{#if form?.error}<div class="error-box">{form.error}</div>{/if}

	{#if showForm}
		<div class="card">
			<form method="POST" use:enhance={() => async ({ update }) => { await update(); showForm = false; }}>
				<div class="field-row">
					<div class="field">
						<label for="name">Name</label>
						<input id="name" name="name" required />
					</div>
					<div class="field">
						<label for="url">Website</label>
						<input id="url" name="url" type="url" placeholder="https://" />
					</div>
				</div>
				<div class="field-row">
					<div class="field">
						<label for="contact_email">Contact email</label>
						<input id="contact_email" name="contact_email" type="email" />
					</div>
					<div class="field">
						<label for="contact_phone">Contact phone</label>
						<input id="contact_phone" name="contact_phone" />
					</div>
				</div>
				<button class="btn btn-primary" type="submit">Save supplier</button>
			</form>
		</div>
	{/if}

	{#if editingSupplier}
		<div class="card">
			<h3>Edit supplier</h3>
			<form
				method="POST"
				action="?/updateSupplier"
				use:enhance={() => async ({ update }) => { await update(); editingSupplier = null; }}
			>
				<input type="hidden" name="id" value={editingSupplier.id} />
				<div class="field-row">
					<div class="field">
						<label for="edit_name">Name</label>
						<input id="edit_name" name="name" required value={editingSupplier.name} />
					</div>
					<div class="field">
						<label for="edit_url">Website</label>
						<input id="edit_url" name="url" type="url" value={editingSupplier.url ?? ''} />
					</div>
				</div>
				<div class="field-row">
					<div class="field">
						<label for="edit_contact_email">Contact email</label>
						<input id="edit_contact_email" name="contact_email" type="email" value={editingSupplier.contact_email ?? ''} />
					</div>
					<div class="field">
						<label for="edit_contact_phone">Contact phone</label>
						<input id="edit_contact_phone" name="contact_phone" value={editingSupplier.contact_phone ?? ''} />
					</div>
				</div>
				<div style="display:flex;gap:0.6rem;">
					<button class="btn btn-primary" type="submit">Save changes</button>
					<button class="btn btn-secondary" type="button" onclick={() => (editingSupplier = null)}>Cancel</button>
				</div>
			</form>
		</div>
	{/if}

	<div class="card">
		{#if data.suppliers.length === 0}
			<div class="empty">No suppliers added yet.</div>
		{:else}
			<table>
				<thead><tr><th>Name</th><th>Website</th><th>Email</th><th>Phone</th><th></th></tr></thead>
				<tbody>
					{#each data.suppliers as s}
						<tr>
							<td>{s.name}</td>
							<td>{#if s.url}<a href={s.url} target="_blank" rel="noopener">{s.url}</a>{:else}—{/if}</td>
							<td>{s.contact_email || '—'}</td>
							<td>{s.contact_phone || '—'}</td>
							<td style="white-space:nowrap;">
								<button
									class="btn btn-secondary"
									style="padding:0.3rem 0.7rem;font-size:0.8rem;"
									onclick={() => { editingSupplier = s; showForm = false; }}
								>Edit</button>
								<form
									method="POST"
									action="?/deleteSupplier"
									style="display:inline;"
									use:enhance
									onsubmit={(e) => {
										if (!confirm(`Delete supplier "${s.name}"?`)) e.preventDefault();
									}}
								>
									<input type="hidden" name="id" value={s.id} />
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
