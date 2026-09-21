<script>
  import { bookings, clients, trips, agents } from '../data.js';
  import { goBack, goTo, notify, currentUser } from '../stores.js';
  import { statusClass } from '../badge.js';
  import Modal from '../Modal.svelte';
  import { apiPost, apiPut, apiDelete } from '../api.js';
  import { downloadCsv, printPdf } from '../export.js';

  export let searchQuery = '';
  let filter = 'All';
  let showModal=false, editing=null, viewing=null;
  let form = { clientName:'', tripName:'', travelDate:'', status:'Pending', amount:0, assignedAgentId:'' };

  $: filters = ['All','Confirmed','Pending','Paid','Partial','Pending Payment'].map(k => ({
    key:k, count: k==='All' ? $bookings.length : $bookings.filter(b=>b.status===k).length
  }));

  $: filtered = $bookings.filter(b => {
    const matchFilter = filter==='All' || b.status===filter;
    const q=(searchQuery||'').toLowerCase();
    const matchSearch = !q || b.clientName.toLowerCase().includes(q) || b.tripName.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  function openAdd(){ editing=null; form={clientName:'',tripName:'',travelDate:'',status:'Pending',amount:0,assignedAgentId:$currentUser?.role === 'agent' ? $currentUser.id : ''}; showModal=true; }
  function openEdit(b){ editing=b.id; form={...b}; showModal=true; }
  async function save(){
    if(!form.clientName || !form.tripName) return;
    try {
      if ($currentUser?.role === 'agent') form.assignedAgentId = $currentUser.id;
      if(editing){ await apiPut(`/bookings/${editing}`, form); bookings.update(l=>l.map(b=>b.id===editing?{...form,id:editing}:b)); notify(`Booking ${editing} updated`); }
      else { const created = await apiPost('/bookings', form); bookings.update(l=>[...l, created]); notify(`New booking ${created.id} created`); }
      showModal=false;
    } catch(e){ alert(e.message); }
  }
  async function remove(id){
    if(!confirm('Delete this booking?')) return;
    try { await apiDelete(`/bookings/${id}`); bookings.update(l=>l.filter(b=>b.id!==id)); }
    catch(e){ alert(e.message); }
  }

  $: viewingClient = viewing ? $clients.find((client) => client.name === viewing.clientName) : null;

  function notifyWhatsApp() {
    if (!viewingClient?.phone) return;
    const message = `Hello ${viewing.clientName}, your ${viewing.tripName} booking is ${viewing.status}. Travel date: ${viewing.travelDate}.`;
    window.open(`https://wa.me/${viewingClient.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  }

  function exportBookings() {
    downloadCsv('travel-bookings.csv', filtered.map((booking) => ({
      ID: booking.id, Client: booking.clientName, Trip: booking.tripName,
      TravelDate: booking.travelDate, Status: booking.status, Amount: booking.amount
    })));
  }
</script>

<div class="page">
  <div class="crumbs"><button on:click={goBack}>← Back</button><span>/</span><button on:click={() => goTo('dashboard')}>Home</button></div>
  <div class="page-header">
    <div><h1 class="page-title">Bookings</h1><div class="page-sub">Track and manage all client bookings</div></div>
    <div class="header-actions"><button class="btn btn-outline" on:click={exportBookings}>⬇ CSV</button><button class="btn btn-outline" on:click={() => printPdf('Travel Bookings')}>🖨 PDF</button><button class="btn btn-primary" on:click={openAdd}>+ New Booking</button></div>
  </div>

  <div class="stat-row">
    <div class="card stat-card"><div class="stat-label">Total Bookings</div><div class="stat-value">{$bookings.length}</div></div>
    <div class="card stat-card"><div class="stat-label">Confirmed</div><div class="stat-value">{$bookings.filter(b=>b.status==='Confirmed').length}</div></div>
    <div class="card stat-card"><div class="stat-label">Paid</div><div class="stat-value">{$bookings.filter(b=>b.status==='Paid').length}</div></div>
    <div class="card stat-card"><div class="stat-label">Pending Payment</div><div class="stat-value">{$bookings.filter(b=>b.status==='Pending Payment').length}</div></div>
  </div>

  <div class="tabs">
    {#each filters as f}<button class="tab-chip" class:active={filter===f.key} on:click={() => (filter=f.key)}>{f.key} ({f.count})</button>{/each}
  </div>

  <div class="card">
    <div class="table-wrap">
      <table>
        <thead><tr><th>Booking ID</th><th>Client</th><th>Trip</th><th>Travel Date</th><th>Status</th><th>Amount</th><th>Actions</th></tr></thead>
        <tbody>
          {#each filtered as b}
            <tr>
              <td>{b.id}</td><td>{b.clientName}</td><td>{b.tripName}</td><td>{b.travelDate}</td>
              <td><span class="badge {statusClass(b.status)}">{b.status}</span></td>
              <td>₹{Number(b.amount).toLocaleString('en-IN')}</td>
              <td>
                <button class="btn-icon" on:click={() => (viewing=b)}>👁️</button>
                <button class="btn-icon" on:click={() => openEdit(b)}>✏️</button>
                <button class="btn-icon" on:click={() => remove(b.id)}>🗑️</button>
              </td>
            </tr>
          {:else}
            <tr><td colspan="7"><div class="empty-state">No bookings found.</div></td></tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>

{#if showModal}
  <Modal title={editing ? 'Edit Booking' : 'New Booking'} on:close={() => (showModal=false)}>
    <div class="form-row"><label>Client</label>
      <select bind:value={form.clientName}>
        <option value="">Select client</option>
        {#each $clients as c}<option value={c.name}>{c.name}</option>{/each}
      </select>
    </div>
    <div class="form-row"><label>Trip</label>
      <select bind:value={form.tripName}>
        <option value="">Select trip</option>
        {#each $trips as t}<option value={t.name}>{t.name}</option>{/each}
      </select>
    </div>
    <div class="two-col">
      <div class="form-row"><label>Travel Date</label><input type="date" bind:value={form.travelDate} /></div>
      <div class="form-row"><label>Amount (₹)</label><input type="number" bind:value={form.amount} /></div>
    </div>
    <div class="form-row"><label>Status</label>
      <select bind:value={form.status}>
        <option>Pending</option><option>Confirmed</option><option>Paid</option><option>Partial</option><option>Pending Payment</option>
      </select>
    </div>
    {#if $currentUser?.role !== 'agent'}<div class="form-row"><label>Assigned Agent</label><select bind:value={form.assignedAgentId}><option value="">Unassigned</option>{#each $agents as agent}<option value={agent.id}>{agent.name}</option>{/each}</select></div>{/if}
    <div class="form-actions">
      <button class="btn btn-outline" on:click={() => (showModal=false)}>Cancel</button>
      <button class="btn btn-primary" on:click={save}>{editing ? 'Save Changes' : 'Create Booking'}</button>
    </div>
  </Modal>
{/if}

{#if viewing}
  <Modal title="Booking Details" on:close={() => (viewing=null)}>
    {#if viewingClient}
      <div class="contact-actions"><a class="btn btn-outline" href={`mailto:${viewingClient.email}`}>✉ Email Update</a><button class="btn btn-outline" on:click={notifyWhatsApp}>💬 WhatsApp Update</button></div>
    {/if}
    <div class="detail-row"><span>Booking ID</span><b>{viewing.id}</b></div>
    <div class="detail-row"><span>Client</span><b>{viewing.clientName}</b></div>
    <div class="detail-row"><span>Trip</span><b>{viewing.tripName}</b></div>
    <div class="detail-row"><span>Travel Date</span><b>{viewing.travelDate}</b></div>
    <div class="detail-row"><span>Status</span><b>{viewing.status}</b></div>
    <div class="detail-row"><span>Amount</span><b>₹{Number(viewing.amount).toLocaleString('en-IN')}</b></div>
  </Modal>
{/if}

<style>
.detail-row{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border);font-size:14px;}
.detail-row:last-child{border-bottom:none;}
.contact-actions{display:flex;gap:8px;margin-bottom:12px;}
</style>
