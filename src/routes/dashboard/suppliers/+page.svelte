<script>
	import { enhance } from '$app/forms';
	let { data, form } = $props();
	let showForm = $state(false);
</script>

<svelte:head><title>Suppliers — Travel Desk</title></svelte:head>

<div class="page">
	<div style="display:flex;justify-content:space-between;align-items:center;">
		<h1>Suppliers</h1>
		<button class="btn btn-primary" onclick={() => (showForm = !showForm)}>
			{showForm ? 'Cancel' : '+ Add supplier'}
		</button>
	</div>

	{#if showForm}
		<div class="card">
			{#if form?.error}<div class="error-box">{form.error}</div>{/if}
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

	<div class="card">
		{#if data.suppliers.length === 0}
			<div class="empty">No suppliers added yet.</div>
		{:else}
			<table>
				<thead><tr><th>Name</th><th>Website</th><th>Email</th><th>Phone</th></tr></thead>
				<tbody>
					{#each data.suppliers as s}
						<tr>
							<td>{s.name}</td>
							<td>{#if s.url}<a href={s.url} target="_blank" rel="noopener">{s.url}</a>{:else}—{/if}</td>
							<td>{s.contact_email || '—'}</td>
							<td>{s.contact_phone || '—'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>
