<script>
  import { trips, agents } from '../data.js';
  import { goBack, goTo, notify, currentUser, navigationContext } from '../stores.js';
  import { statusClass } from '../badge.js';
  import Modal from '../Modal.svelte';
  import { apiPost, apiPut, apiDelete } from '../api.js';

  export let searchQuery = '';
  let filter = 'All';
  let showModal = false, editing = null, viewing = null;
  let form = { name:'', destination:'', startDate:'', endDate:'', status:'Pending', assignedAgentId:'' };

  $: filters = ['All','Confirmed','Pending','Completed','Cancelled'].map(k => ({
    key:k, count: k==='All' ? $trips.length : $trips.filter(t=>t.status===k).length
  }));

  $: filtered = $trips.filter((t) => {
    const matchFilter = filter==='All' || t.status===filter;
    const q = (searchQuery||'').toLowerCase();
    const matchSearch = !q || t.name.toLowerCase().includes(q) || t.destination.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  function openAdd(){ editing=null; form={name:'',destination:'',startDate:'',endDate:'',status:'Pending',assignedAgentId:$currentUser?.role === 'agent' ? $currentUser.id : ''}; showModal=true; }
  function openEdit(t){ editing=t.id; form={...t, startDate:(t.startDate || '').slice(0, 10), endDate:(t.endDate || '').slice(0, 10)}; showModal=true; }
  $: if ($navigationContext.viewTripId && viewing?.id !== $navigationContext.viewTripId) {
    viewing = $trips.find((trip) => String(trip.id) === String($navigationContext.viewTripId)) || null;
    navigationContext.set({});
  }
  async function save(){
    if(!form.name) return;
    try {
      if (currentUser && $currentUser?.role === 'agent') form.assignedAgentId = $currentUser.id;
      if(editing){
        await apiPut(`/trips/${editing}`, form);
        trips.update(list=>list.map(t=>t.id===editing?{...form,id:editing}:t));
        notify(`Trip ${form.name} updated`);
      } else {
        const created = await apiPost('/trips', form);
        trips.update(list=>[...list, created]);
        notify(`New trip ${form.name} created`);
      }
      showModal=false;
    } catch(e){ alert(`Could not save trip: ${e.message}`); }
  }
  async function remove(id){
    if(!confirm('Delete this trip?')) return;
    try { await apiDelete(`/trips/${id}`); trips.update(list=>list.filter(t=>t.id!==id)); }
    catch(e){ alert(e.message); }
  }
</script>

<div class="page">
  <div class="crumbs"><button on:click={goBack}>← Back</button><span>/</span><button on:click={() => goTo('dashboard')}>Home</button></div>
  <div class="page-header">
    <div><h1 class="page-title">Trips</h1><div class="page-sub">Access and create trips for your clients</div></div>
    <button class="btn btn-primary" on:click={openAdd}>+ Add Trip</button>
  </div>
  {#if $navigationContext.clientName}<div class="flow-banner">Planning a trip for <b>{$navigationContext.clientName}</b>. After creating the trip, open it to continue with itinerary and booking.</div>{/if}

  <div class="stat-row">
    <div class="card stat-card"><div class="stat-label">Total Trips</div><div class="stat-value">{$trips.length}</div></div>
    <div class="card stat-card"><div class="stat-label">Confirmed</div><div class="stat-value">{$trips.filter(t=>t.status==='Confirmed').length}</div></div>
    <div class="card stat-card"><div class="stat-label">Pending</div><div class="stat-value">{$trips.filter(t=>t.status==='Pending').length}</div></div>
    <div class="card stat-card"><div class="stat-label">Completed</div><div class="stat-value">{$trips.filter(t=>t.status==='Completed').length}</div></div>
  </div>

  <div class="tabs">
    {#each filters as f}<button class="tab-chip" class:active={filter===f.key} on:click={() => (filter=f.key)}>{f.key} ({f.count})</button>{/each}
  </div>

  <div class="card">
    <div class="table-wrap">
      <table>
        <thead><tr><th>ID</th><th>Trip Name</th><th>Destination</th><th>Start Date</th><th>End Date</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {#each filtered as t}
            <tr>
              <td>{t.id}</td><td><button class="detail-link" on:click={() => (viewing=t)}>{t.name}</button></td><td><button class="detail-link" on:click={() => (viewing=t)}>{t.destination}</button></td><td>{t.startDate}</td><td>{t.endDate}</td>
              <td><span class="badge {statusClass(t.status)}">{t.status}</span></td>
              <td>
                <button class="btn-icon" on:click={() => openEdit(t)}>✏️</button>
                <button class="btn-icon" on:click={() => remove(t.id)}>🗑️</button>
              </td>
            </tr>
          {:else}
            <tr><td colspan="7"><div class="empty-state">No trips found.</div></td></tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>

{#if showModal}
  <Modal title={editing ? 'Edit Trip' : 'Add New Trip'} on:close={() => (showModal=false)}>
    <div class="form-row"><label>Trip Name</label><input bind:value={form.name} /></div>
    <div class="form-row"><label>Destination</label><input bind:value={form.destination} /></div>
    <div class="two-col">
      <div class="form-row"><label>Start Date</label><input type="date" bind:value={form.startDate} /></div>
      <div class="form-row"><label>End Date</label><input type="date" bind:value={form.endDate} /></div>
    </div>
    <div class="form-row"><label>Status</label>
      <select bind:value={form.status}><option>Pending</option><option>Confirmed</option><option>Completed</option><option>Cancelled</option></select>
    </div>
    {#if $currentUser?.role !== 'agent'}<div class="form-row"><label>Assigned Agent</label><select bind:value={form.assignedAgentId}><option value="">Unassigned</option>{#each $agents as agent}<option value={agent.id}>{agent.name}</option>{/each}</select></div>{/if}
    <div class="form-actions">
      <button class="btn btn-outline" on:click={() => (showModal=false)}>Cancel</button>
      <button class="btn btn-primary" on:click={save}>{editing ? 'Save Changes' : 'Add Trip'}</button>
    </div>
  </Modal>
{/if}

{#if viewing}
  <Modal title="Trip Details" on:close={() => (viewing=null)}>
    <div class="detail-row"><span>ID</span><b>{viewing.id}</b></div>
    <div class="detail-row"><span>Name</span><b>{viewing.name}</b></div>
    <div class="detail-row"><span>Destination</span><b>{viewing.destination}</b></div>
    <div class="detail-row"><span>Start Date</span><b>{viewing.startDate}</b></div>
    <div class="detail-row"><span>End Date</span><b>{viewing.endDate}</b></div>
    <div class="detail-row"><span>Status</span><b>{viewing.status}</b></div>
    <div class="flow-actions"><button class="btn btn-outline" on:click={() => goTo('trip-map')}>View trip map</button><button class="btn btn-primary" on:click={() => goTo('itinerary', { tripId: viewing.id })}>Continue to itinerary →</button></div>
  </Modal>
{/if}

<style>
.detail-row{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border);font-size:14px;}
.detail-row:last-child{border-bottom:none;}
.flow-banner{margin:-8px 0 18px;padding:11px 14px;border-radius:9px;background:#ecfdf5;color:var(--teal-dark);font-size:13px;}
.detail-link{background:none;border:0;padding:0;color:var(--teal);font:inherit;font-weight:700;text-align:left;}.detail-link:hover{text-decoration:underline;}.flow-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px;}
</style>
