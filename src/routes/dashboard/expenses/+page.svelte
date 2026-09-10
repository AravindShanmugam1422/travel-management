<script>
	import { enhance } from '$app/forms';
	let { data, form } = $props();
	let showForm = $state(false);
</script>

<svelte:head><title>My Expenses — Travel Desk</title></svelte:head>

<div class="page">
	<div style="display:flex;justify-content:space-between;align-items:center;">
		<h1>My Expenses</h1>
		<button class="btn btn-primary" onclick={() => (showForm = !showForm)}>
			{showForm ? 'Cancel' : '+ Add expense'}
		</button>
	</div>
	<p style="color:var(--muted);">Trip ku vela panna nenju kai chelavu — reimbursement ku track pannunga.</p>

	{#if showForm}
		<div class="card">
			{#if form?.error}<div class="error-box">{form.error}</div>{/if}
			<form
				method="POST"
				action="?/addExpense"
				use:enhance={() => async ({ update }) => { await update(); showForm = false; }}
			>
				<div class="field">
					<label for="description">Description</label>
					<input id="description" name="description" required placeholder="e.g. Taxi fare to airport" />
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
						<label for="expense_date">Date</label>
						<input id="expense_date" name="expense_date" type="date" />
					</div>
				</div>
				<div class="field">
					<label for="trip_id">Related trip (optional)</label>
					<select id="trip_id" name="trip_id">
						<option value="">— None —</option>
						{#each data.trips as t}
							<option value={t.id}>{t.trip_name}</option>
						{/each}
					</select>
				</div>
				<button class="btn btn-primary" type="submit">Save expense</button>
			</form>
		</div>
	{/if}

	<div class="card">
		{#if data.expenses.length === 0}
			<div class="empty">Expenses illa innum.</div>
		{:else}
			<table>
				<thead><tr><th>Description</th><th>Trip</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
				<tbody>
					{#each data.expenses as e}
						<tr>
							<td>{e.description}</td>
							<td>{e.trip_name || '—'}</td>
							<td>{e.amount} {e.currency}</td>
							<td>{e.expense_date ? new Date(e.expense_date).toLocaleDateString('en-IN') : '—'}</td>
							<td>
								<form method="POST" action="?/toggleReimbursed" use:enhance>
									<input type="hidden" name="id" value={e.id} />
									<button
										type="submit"
										class="stamp {e.reimbursed ? 'stamp-teal' : 'stamp-muted'}"
										style="border:1px solid currentColor;background:none;cursor:pointer;"
									>
										{e.reimbursed ? 'Reimbursed' : 'Pending'}
									</button>
								</form>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>
