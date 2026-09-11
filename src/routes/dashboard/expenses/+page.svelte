<script>
	import { enhance } from '$app/forms';
	let { data, form } = $props();
	let showForm = $state(false);
	let editingExpense = $state(null);
</script>

<svelte:head><title>My Expenses — Travel Desk</title></svelte:head>

<div class="page">
	<div style="display:flex;justify-content:space-between;align-items:center;">
		<h1>My Expenses</h1>
		<button class="btn btn-primary" onclick={() => { showForm = !showForm; editingExpense = null; }}>
			{showForm ? 'Cancel' : '+ Add expense'}
		</button>
	</div>
	<p style="color:var(--muted);">Track out-of-pocket expenses from trip work — for reimbursement.</p>

	{#if form?.error}<div class="error-box">{form.error}</div>{/if}

	{#if showForm}
		<div class="card">
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

	{#if editingExpense}
		<div class="card">
			<h3>Edit expense</h3>
			<form
				method="POST"
				action="?/updateExpense"
				use:enhance={() => async ({ update }) => { await update(); editingExpense = null; }}
			>
				<input type="hidden" name="id" value={editingExpense.id} />
				<div class="field">
					<label for="edit_description">Description</label>
					<input id="edit_description" name="description" required value={editingExpense.description} />
				</div>
				<div class="field-row">
					<div class="field">
						<label for="edit_amount">Amount</label>
						<input id="edit_amount" name="amount" type="number" step="0.01" required value={editingExpense.amount} />
					</div>
					<div class="field">
						<label for="edit_currency">Currency</label>
						<input id="edit_currency" name="currency" value={editingExpense.currency} style="max-width:100px;" />
					</div>
					<div class="field">
						<label for="edit_expense_date">Date</label>
						<input id="edit_expense_date" name="expense_date" type="date" value={editingExpense.expense_date ? editingExpense.expense_date.slice(0,10) : ''} />
					</div>
				</div>
				<div class="field">
					<label for="edit_trip_id">Related trip (optional)</label>
					<select id="edit_trip_id" name="trip_id">
						<option value="">— None —</option>
						{#each data.trips as t}
							<option value={t.id} selected={t.id === editingExpense.trip_id}>{t.trip_name}</option>
						{/each}
					</select>
				</div>
				<div style="display:flex;gap:0.6rem;">
					<button class="btn btn-primary" type="submit">Save changes</button>
					<button class="btn btn-secondary" type="button" onclick={() => (editingExpense = null)}>Cancel</button>
				</div>
			</form>
		</div>
	{/if}

	<div class="card">
		{#if data.expenses.length === 0}
			<div class="empty">No expenses added yet.</div>
		{:else}
			<table>
				<thead><tr><th>Description</th><th>Trip</th><th>Amount</th><th>Date</th><th>Status</th><th></th></tr></thead>
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
							<td style="white-space:nowrap;">
								<button
									class="btn btn-secondary"
									style="padding:0.3rem 0.7rem;font-size:0.8rem;"
									onclick={() => { editingExpense = e; showForm = false; }}
								>Edit</button>
								<form
									method="POST"
									action="?/deleteExpense"
									style="display:inline;"
									use:enhance
									onsubmit={(e2) => {
										if (!confirm(`Delete expense "${e.description}"?`)) e2.preventDefault();
									}}
								>
									<input type="hidden" name="id" value={e.id} />
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
