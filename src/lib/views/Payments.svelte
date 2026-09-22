<script>
  import { payments, clients } from '../data.js';
  import { goBack, goTo, notify, currentUser } from '../stores.js';
  import { statusClass } from '../badge.js';
  import Modal from '../Modal.svelte';
  import { apiPost, apiPut, apiDelete } from '../api.js';

  export let searchQuery = '';
  let showModal=false, editing=null, viewing=null;
  let form = { name:'', method:'Bank Transfer', amount:0, date:'', status:'Received', proof:'' };

  $: isAgent = $currentUser && $currentUser.role === 'agent';
  $: visiblePayments = isAgent ? $payments.filter(p => p.name === $currentUser.name) : $payments;

  $: total = visiblePayments.reduce((s,p)=>s+Number(p.amount||0),0);
  $: received = visiblePayments.filter(p=>p.status==='Received').reduce((s,p)=>s+Number(p.amount||0),0);
  $: outstanding = visiblePayments.filter(p=>p.status==='Outstanding').reduce((s,p)=>s+Number(p.amount||0),0);
  $: overdue = visiblePayments.filter(p=>p.status==='Overdue').reduce((s,p)=>s+Number(p.amount||0),0);

  $: filtered = visiblePayments.filter(p => {
    const q=(searchQuery||'').toLowerCase();
    return !q || p.name.toLowerCase().includes(q);
  });

  function openAdd(){ editing=null; form={name:'',method:'Bank Transfer',amount:0,date:'',status:'Received',proof:''}; showModal=true; }
  function openEdit(p){ editing=p.id; form={...p}; showModal=true; }
  async function save(){
    if(!form.name) return;
    try {
      if(editing){ await apiPut(`/payments/${editing}`, form); payments.update(l=>l.map(p=>p.id===editing?{...form,id:editing}:p)); notify(`Payment ${editing} updated`); }
      else { const created = await apiPost('/payments', form); payments.update(l=>[...l, created]); notify('New payment record added'); }
      showModal=false;
    } catch(e){ alert(e.message); }
  }
  async function remove(id){
    if(!confirm('Delete this payment record?')) return;
    try { await apiDelete(`/payments/${id}`); payments.update(l=>l.filter(p=>p.id!==id)); }
    catch(e){ alert(e.message); }
  }

  function exportPdf() {
    const rows = filtered.map(p => `<tr><td>${p.id}</td><td>${p.name}</td><td>${p.method}</td><td>${p.date}</td><td>${p.status}</td><td>₹${Number(p.amount).toLocaleString('en-IN')}</td></tr>`).join('');
    const html = `<html><head><title>Payments Report</title><style>
      body{font-family:Arial,sans-serif;padding:24px;} h1{font-size:18px;}
      table{width:100%;border-collapse:collapse;margin-top:16px;}
      th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:13px;}
      th{background:#0d9488;color:#fff;}
      </style></head><body>
      <h1>Travel Management &mdash; Payments Report</h1>
      <p>Generated: ${new Date().toLocaleString()}</p>
      <table><thead><tr><th>ID</th><th>Client/Agent</th><th>Method</th><th>Date</th><th>Status</th><th>Amount</th></tr></thead>
      <tbody>${rows}</tbody></table>
      </body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  }
</script>

<div class="page">
  <div class="crumbs"><button on:click={goBack}>← Back</button><span>/</span><button on:click={() => goTo('dashboard')}>Home</button></div>
  <div class="page-header">
    <div><h1 class="page-title">Payments</h1><div class="page-sub">{isAgent ? 'Your payment records' : 'All payment records across the business'}</div></div>
    <div style="display:flex;gap:10px;">
      <button class="btn btn-outline" on:click={exportPdf}>Export PDF</button>
      <button class="btn btn-primary" on:click={openAdd}>+ New Payment</button>
    </div>
  </div>

  <div class="stat-row">
    <div class="card stat-card"><div class="stat-label">Total Payments</div><div class="stat-value">₹{total.toLocaleString('en-IN')}</div></div>
    <div class="card stat-card"><div class="stat-label">Received</div><div class="stat-value">₹{received.toLocaleString('en-IN')}</div></div>
    <div class="card stat-card"><div class="stat-label">Outstanding</div><div class="stat-value">₹{outstanding.toLocaleString('en-IN')}</div></div>
    <div class="card stat-card"><div class="stat-label">Overdue</div><div class="stat-value">₹{overdue.toLocaleString('en-IN')}</div></div>
  </div>

  <div class="card">
    <div class="table-wrap">
      <table>
        <thead><tr><th>ID</th><th>Client/Agent</th><th>Method</th><th>Date</th><th>Status</th><th>Amount</th><th>Actions</th></tr></thead>
        <tbody>
          {#each filtered as p}
            <tr>
              <td>{p.id}</td><td><button class="detail-link" on:click={() => (viewing=p)}>{p.name}</button></td><td><button class="detail-link" on:click={() => (viewing=p)}>{p.method}</button></td><td><button class="detail-link" on:click={() => (viewing=p)}>{p.date}</button></td>
              <td><span class="badge {statusClass(p.status)}">{p.status}</span></td>
              <td>₹{Number(p.amount).toLocaleString('en-IN')}</td>
              <td>
                <button class="btn-icon" on:click={() => openEdit(p)}>✏️</button>
                <button class="btn-icon" on:click={() => remove(p.id)}>🗑️</button>
              </td>
            </tr>
          {:else}
            <tr><td colspan="7"><div class="empty-state">No payment records found.</div></td></tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>

{#if showModal}
  <Modal title={editing ? 'Edit Payment' : 'New Payment Record'} on:close={() => (showModal=false)}>
    <div class="form-row"><label>Client / Agent Name</label>
      <select bind:value={form.name}>
        <option value="">Select</option>
        {#each $clients as c}<option value={c.name}>{c.name}</option>{/each}
      </select>
    </div>
    <div class="two-col">
      <div class="form-row"><label>Method</label>
        <select bind:value={form.method}><option>Bank Transfer</option><option>UPI</option><option>Card</option><option>Net Banking</option><option>Cash</option></select>
      </div>
      <div class="form-row"><label>Amount (₹)</label><input type="number" bind:value={form.amount} /></div>
    </div>
    <div class="two-col">
      <div class="form-row"><label>Date</label><input type="date" bind:value={form.date} /></div>
      <div class="form-row"><label>Status</label>
        <select bind:value={form.status}><option>Received</option><option>Outstanding</option><option>Overdue</option></select>
      </div>
    </div>
    <div class="form-row"><label>Proof / Reference (optional)</label><input bind:value={form.proof} placeholder="Transaction ID / file name" /></div>
    <div class="form-actions">
      <button class="btn btn-outline" on:click={() => (showModal=false)}>Cancel</button>
      <button class="btn btn-primary" on:click={save}>{editing ? 'Save Changes' : 'Add Payment'}</button>
    </div>
  </Modal>
{/if}

{#if viewing}
  <Modal title="Payment Details" on:close={() => (viewing=null)}>
    <div class="detail-row"><span>ID</span><b>{viewing.id}</b></div>
    <div class="detail-row"><span>Name</span><b>{viewing.name}</b></div>
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
.detail-link{background:none;border:0;padding:0;color:var(--teal);font:inherit;font-weight:700;text-align:left;}.detail-link:hover{text-decoration:underline;}
</style>
