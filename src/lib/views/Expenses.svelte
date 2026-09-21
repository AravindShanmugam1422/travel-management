<script>
  import { expenses, clients, trips } from '../data.js';
  import { goBack, goTo, notify, currentUser } from '../stores.js';
  import { statusClass } from '../badge.js';
  import Modal from '../Modal.svelte';
  import { apiPost, apiPut, apiDelete } from '../api.js';

  export let searchQuery = '';
  let filter = 'All';
  let showModal=false, editing=null, viewing=null;
  let form = { clientName:'', tripName:'', purpose:'', method:'Cash', amount:0, date:'', status:'Unpaid', proof:'' };

  $: filters = ['All','Paid','Unpaid'].map(k => ({
    key:k, count: k==='All' ? $expenses.length : $expenses.filter(e=>e.status===k).length
  }));

  $: total = $expenses.reduce((s,e)=>s+Number(e.amount||0),0);
  $: paid = $expenses.filter(e=>e.status==='Paid').reduce((s,e)=>s+Number(e.amount||0),0);
  $: unpaid = $expenses.filter(e=>e.status==='Unpaid').reduce((s,e)=>s+Number(e.amount||0),0);

  $: filtered = $expenses.filter(e => {
    const matchFilter = filter==='All' || e.status===filter;
    const q=(searchQuery||'').toLowerCase();
    const matchSearch = !q || e.purpose.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  function openAdd(){ editing=null; form={clientName:'',tripName:'',purpose:'',method:'Cash',amount:0,date:'',status:'Unpaid',proof:''}; showModal=true; }
  function openEdit(e){ editing=e.id; form={...e}; showModal=true; }
  async function save(){
    if(!form.purpose) return;
    try {
      if(editing){ await apiPut(`/expenses/${editing}`, form); expenses.update(l=>l.map(e=>e.id===editing?{...form,id:editing}:e)); notify(`Expense ${editing} updated`); }
      else { const created = await apiPost('/expenses', form); expenses.update(l=>[...l, created]); notify('New expense recorded'); }
      showModal=false;
    } catch(e){ alert(e.message); }
  }
  async function remove(id){
    if(!confirm('Delete this expense?')) return;
    try { await apiDelete(`/expenses/${id}`); expenses.update(l=>l.filter(e=>e.id!==id)); }
    catch(e){ alert(e.message); }
  }
</script>

<div class="page">
  <div class="crumbs"><button on:click={goBack}>← Back</button><span>/</span><button on:click={() => goTo('dashboard')}>Home</button></div>
  <div class="page-header">
    <div><h1 class="page-title">Expenses</h1><div class="page-sub">Track business expenses, purpose and proof</div></div>
    <button class="btn btn-primary" on:click={openAdd}>+ Add Expense</button>
  </div>

  <div class="stat-row">
    <div class="card stat-card"><div class="stat-label">Total Expenses</div><div class="stat-value">₹{total.toLocaleString('en-IN')}</div></div>
    <div class="card stat-card"><div class="stat-label">Paid</div><div class="stat-value">₹{paid.toLocaleString('en-IN')}</div></div>
    <div class="card stat-card"><div class="stat-label">Unpaid</div><div class="stat-value">₹{unpaid.toLocaleString('en-IN')}</div></div>
  </div>

  <div class="tabs">
    {#each filters as f}<button class="tab-chip" class:active={filter===f.key} on:click={() => (filter=f.key)}>{f.key} ({f.count})</button>{/each}
  </div>

  <div class="card">
    <div class="table-wrap">
      <table>
        <thead><tr><th>ID</th><th>Client</th><th>Trip</th><th>Purpose</th><th>Method</th><th>Date</th><th>Status</th><th>Amount</th><th>Actions</th></tr></thead>
        <tbody>
          {#each filtered as e}
            <tr>
              <td>{e.id}</td><td>{e.clientName || 'General'}</td><td>{e.tripName || 'General'}</td><td>{e.purpose}</td><td>{e.method}</td><td>{e.date}</td>
              <td><span class="badge {statusClass(e.status)}">{e.status}</span></td>
              <td>₹{Number(e.amount).toLocaleString('en-IN')}</td>
              <td>
                <button class="btn-icon" on:click={() => (viewing=e)}>👁️</button>
                <button class="btn-icon" on:click={() => openEdit(e)}>✏️</button>
                <button class="btn-icon" on:click={() => remove(e.id)}>🗑️</button>
              </td>
            </tr>
          {:else}
            <tr><td colspan="9"><div class="empty-state">No expenses found.</div></td></tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>

{#if showModal}
  <Modal title={editing ? 'Edit Expense' : 'Add Expense'} on:close={() => (showModal=false)}>
    <div class="two-col">
      <div class="form-row"><label>Client</label><select bind:value={form.clientName}><option value="">General expense</option>{#each $clients as client}<option value={client.name}>{client.name}</option>{/each}</select></div>
      <div class="form-row"><label>Trip</label><select bind:value={form.tripName}><option value="">General expense</option>{#each $trips as trip}<option value={trip.name}>{trip.name}</option>{/each}</select></div>
    </div>
    <div class="form-row"><label>Purpose</label><input bind:value={form.purpose} placeholder="e.g. Fuel, Hotel Stay, Food" /></div>
    <div class="two-col">
      <div class="form-row"><label>Method</label>
        <select bind:value={form.method}><option>Cash</option><option>Card</option><option>UPI</option><option>Bank Transfer</option></select>
      </div>
      <div class="form-row"><label>Amount (₹)</label><input type="number" bind:value={form.amount} /></div>
    </div>
    <div class="two-col">
      <div class="form-row"><label>Date</label><input type="date" bind:value={form.date} /></div>
      <div class="form-row"><label>Status</label>
        <select bind:value={form.status}><option>Unpaid</option><option>Paid</option></select>
      </div>
    </div>
    <div class="form-row"><label>Proof / Bill (optional)</label><input bind:value={form.proof} placeholder="Bill reference / file name" /></div>
    <div class="form-actions">
      <button class="btn btn-outline" on:click={() => (showModal=false)}>Cancel</button>
      <button class="btn btn-primary" on:click={save}>{editing ? 'Save Changes' : 'Add Expense'}</button>
    </div>
  </Modal>
{/if}

{#if viewing}
  <Modal title="Expense Details" on:close={() => (viewing=null)}>
    <div class="detail-row"><span>ID</span><b>{viewing.id}</b></div>
    <div class="detail-row"><span>Client</span><b>{viewing.clientName || 'General'}</b></div>
    <div class="detail-row"><span>Trip</span><b>{viewing.tripName || 'General'}</b></div>
    <div class="detail-row"><span>Purpose</span><b>{viewing.purpose}</b></div>
    <div class="detail-row"><span>Method</span><b>{viewing.method}</b></div>
    <div class="detail-row"><span>Date</span><b>{viewing.date}</b></div>
    <div class="detail-row"><span>Status</span><b>{viewing.status}</b></div>
    <div class="detail-row"><span>Amount</span><b>₹{Number(viewing.amount).toLocaleString('en-IN')}</b></div>
    {#if viewing.proof}<div class="detail-row"><span>Proof</span><b>{viewing.proof}</b></div>{/if}
  </Modal>
{/if}

<style>
.detail-row{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border);font-size:14px;}
.detail-row:last-child{border-bottom:none;}
</style>
