<script>
  import { trips } from '../data.js';
  import { goBack, goTo, notify } from '../stores.js';
  import { statusClass } from '../badge.js';
  import Modal from '../Modal.svelte';
  import { apiPost, apiPut, apiDelete } from '../api.js';

  export let searchQuery = '';
  let filter = 'All';
  let showModal = false, editing = null, viewing = null;
  let form = { name:'', destination:'', startDate:'', endDate:'', status:'Pending' };

  $: filters = ['All','Confirmed','Pending','Completed','Cancelled'].map(k => ({
    key:k, count: k==='All' ? $trips.length : $trips.filter(t=>t.status===k).length
  }));

  $: filtered = $trips.filter((t) => {
    const matchFilter = filter==='All' || t.status===filter;
    const q = (searchQuery||'').toLowerCase();
    const matchSearch = !q || t.name.toLowerCase().includes(q) || t.destination.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  function openAdd(){ editing=null; form={name:'',destination:'',startDate:'',endDate:'',status:'Pending'}; showModal=true; }
  function openEdit(t){ editing=t.id; form={...t}; showModal=true; }
  async function save(){
    if(!form.name) return;
    try {
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
    } catch(e){ alert(e.message); }
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
              <td>{t.id}</td><td>{t.name}</td><td>{t.destination}</td><td>{t.startDate}</td><td>{t.endDate}</td>
              <td><span class="badge {statusClass(t.status)}">{t.status}</span></td>
              <td>
                <button class="btn-icon" on:click={() => (viewing=t)}>👁️</button>
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
  </Modal>
{/if}

<style>
.detail-row{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border);font-size:14px;}
.detail-row:last-child{border-bottom:none;}
</style>
