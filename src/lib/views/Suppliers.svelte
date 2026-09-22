<script>
  import { suppliers } from '../data.js';
  import { goBack, goTo, notify } from '../stores.js';
  import { statusClass } from '../badge.js';
  import Modal from '../Modal.svelte';
  import { apiPost, apiPut, apiDelete } from '../api.js';

  export let searchQuery = '';
  let filter = 'All';
  let showModal=false, editing=null, viewing=null;
  let form = { name:'', type:'Hotel', contact:'', status:'Active' };

  $: filters = ['All','Active','Inactive','Hotel','Package'].map(k => ({
    key:k, count: k==='All' ? $suppliers.length : (k==='Active'||k==='Inactive') ? $suppliers.filter(s=>s.status===k).length : $suppliers.filter(s=>s.type===k).length
  }));

  $: filtered = $suppliers.filter(s => {
    const matchFilter = filter==='All' || s.status===filter || s.type===filter;
    const q=(searchQuery||'').toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  function openAdd(){ editing=null; form={name:'',type:'Hotel',contact:'',status:'Active'}; showModal=true; }
  function openEdit(s){ editing=s.id; form={...s}; showModal=true; }
  async function save(){
    if(!form.name) return;
    try {
      if(editing){ await apiPut(`/suppliers/${editing}`, form); suppliers.update(l=>l.map(s=>s.id===editing?{...form,id:editing}:s)); notify(`Supplier ${form.name} updated`); }
      else { const created = await apiPost('/suppliers', form); suppliers.update(l=>[...l, created]); notify(`New supplier ${form.name} added`); }
      showModal=false;
    } catch(e){ alert(e.message); }
  }
  async function remove(id){
    if(!confirm('Delete this supplier?')) return;
    try { await apiDelete(`/suppliers/${id}`); suppliers.update(l=>l.filter(s=>s.id!==id)); }
    catch(e){ alert(e.message); }
  }
</script>

<div class="page">
  <div class="crumbs"><button on:click={goBack}>← Back</button><span>/</span><button on:click={() => goTo('dashboard')}>Home</button></div>
  <div class="page-header">
    <div><h1 class="page-title">Suppliers</h1><div class="page-sub">Hotels, travels and package suppliers</div></div>
    <button class="btn btn-primary" on:click={openAdd}>+ Add Supplier</button>
  </div>

  <div class="stat-row">
    <div class="card stat-card"><div class="stat-label">Total Suppliers</div><div class="stat-value">{$suppliers.length}</div></div>
    <div class="card stat-card"><div class="stat-label">Active</div><div class="stat-value">{$suppliers.filter(s=>s.status==='Active').length}</div></div>
    <div class="card stat-card"><div class="stat-label">Hotel Suppliers</div><div class="stat-value">{$suppliers.filter(s=>s.type==='Hotel').length}</div></div>
    <div class="card stat-card"><div class="stat-label">Package Suppliers</div><div class="stat-value">{$suppliers.filter(s=>s.type==='Package').length}</div></div>
  </div>

  <div class="tabs">
    {#each filters as f}<button class="tab-chip" class:active={filter===f.key} on:click={() => (filter=f.key)}>{f.key} ({f.count})</button>{/each}
  </div>

  <div class="card">
    <div class="table-wrap">
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Contact</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {#each filtered as s}
            <tr>
              <td>{s.id}</td><td><button class="detail-link" on:click={() => (viewing=s)}>{s.name}</button></td><td><button class="detail-link" on:click={() => (viewing=s)}>{s.type}</button></td><td><button class="detail-link" on:click={() => (viewing=s)}>{s.contact}</button></td>
              <td><span class="badge {statusClass(s.status)}">{s.status}</span></td>
              <td>
                <button class="btn-icon" on:click={() => openEdit(s)}>✏️</button>
                <button class="btn-icon" on:click={() => remove(s.id)}>🗑️</button>
              </td>
            </tr>
          {:else}
            <tr><td colspan="6"><div class="empty-state">No suppliers found.</div></td></tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>

{#if showModal}
  <Modal title={editing ? 'Edit Supplier' : 'Add New Supplier'} on:close={() => (showModal=false)}>
    <div class="form-row"><label>Supplier Name</label><input bind:value={form.name} /></div>
    <div class="two-col">
      <div class="form-row"><label>Type</label>
        <select bind:value={form.type}><option>Hotel</option><option>Travels</option><option>Package</option></select>
      </div>
      <div class="form-row"><label>Status</label>
        <select bind:value={form.status}><option>Active</option><option>Inactive</option></select>
      </div>
    </div>
    <div class="form-row"><label>Contact</label><input bind:value={form.contact} /></div>
    <div class="form-actions">
      <button class="btn btn-outline" on:click={() => (showModal=false)}>Cancel</button>
      <button class="btn btn-primary" on:click={save}>{editing ? 'Save Changes' : 'Add Supplier'}</button>
    </div>
  </Modal>
{/if}

{#if viewing}
  <Modal title="Supplier Details" on:close={() => (viewing=null)}>
    <div class="detail-row"><span>ID</span><b>{viewing.id}</b></div>
    <div class="detail-row"><span>Name</span><b>{viewing.name}</b></div>
    <div class="detail-row"><span>Type</span><b>{viewing.type}</b></div>
    <div class="detail-row"><span>Contact</span><b>{viewing.contact}</b></div>
    <div class="detail-row"><span>Status</span><b>{viewing.status}</b></div>
  </Modal>
{/if}

<style>
.detail-row{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border);font-size:14px;}
.detail-row:last-child{border-bottom:none;}
.detail-link{background:none;border:0;padding:0;color:var(--teal);font:inherit;font-weight:700;text-align:left;}.detail-link:hover{text-decoration:underline;}
</style>
