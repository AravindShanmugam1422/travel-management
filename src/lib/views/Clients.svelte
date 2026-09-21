<script>
  import { clients, bookings, agents } from '../data.js';
  import { goBack, goTo, notify, currentUser } from '../stores.js';
  import { statusClass } from '../badge.js';
  import Modal from '../Modal.svelte';
  import { apiPost, apiPut, apiDelete } from '../api.js';

  export let searchQuery = '';

  let filter = 'All';
  let showModal = false;
  let editing = null;
  let form = { name:'', email:'', phone:'', type:'Regular', status:'Active', assignedAgentId:'', passengers:[] };
  let viewing = null;
  let documents = {};

  if (typeof localStorage !== 'undefined') {
    try { documents = JSON.parse(localStorage.getItem('tm_client_documents') || '{}'); } catch (e) { documents = {}; }
  }

  $: filters = [
    { key: 'All', count: $clients.length },
    { key: 'Active', count: $clients.filter(c=>c.status==='Active').length },
    { key: 'Inactive', count: $clients.filter(c=>c.status==='Inactive').length },
    { key: 'New', count: $clients.filter(c=>c.type==='New').length },
    { key: 'VIP', count: $clients.filter(c=>c.type==='VIP').length },
    { key: 'Regular', count: $clients.filter(c=>c.type==='Regular').length }
  ];

  $: filtered = $clients.filter((c) => {
    const matchFilter = filter === 'All' || c.status === filter || c.type === filter;
    const q = (searchQuery || '').toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  function openAdd() {
    editing = null;
    form = { name:'', email:'', phone:'', type:'Regular', status:'Active', assignedAgentId:'', passengers:[] };
    showModal = true;
  }
  function openEdit(c) {
    editing = c.id;
    form = { ...c, passengers: parsePassengers(c.passengers) };
    showModal = true;
  }
  let saving = false;
  function parsePassengers(value) {
    if (Array.isArray(value)) return value;
    try { return value ? JSON.parse(value) : []; } catch (e) { return []; }
  }
  function addPassenger() { form = { ...form, passengers: [...form.passengers, { name:'', relation:'', age:'' }] }; }
  function removePassenger(index) { form = { ...form, passengers: form.passengers.filter((_, i) => i !== index) }; }
  async function save() {
    if (!form.name || saving) return;
    if ($currentUser?.role === 'agent') form.assignedAgentId = $currentUser.id;
    saving = true;
    try {
      if (editing) {
        const payload = { ...form, assigned_agent_id: form.assignedAgentId || null, passengers: JSON.stringify(form.passengers || []) };
        await apiPut(`/clients/${editing}`, payload);
        clients.update((list) => list.map((c) => (c.id === editing ? { ...c, ...form, id: editing } : c)));
        notify(`Client ${form.name} updated`);
      } else {
        const created = await apiPost('/clients', { ...form, assigned_agent_id: form.assignedAgentId || null, passengers: JSON.stringify(form.passengers || []) });
        clients.update((list) => [...list, created]);
        notify(`New client ${form.name} added`);
      }
      showModal = false;
    } catch (e) {
      alert(e.message);
    } finally {
      saving = false;
    }
  }
  async function remove(id) {
    if (!confirm('Delete this client?')) return;
    try {
      await apiDelete(`/clients/${id}`);
      clients.update((list) => list.filter((c) => c.id !== id));
    } catch (e) {
      alert(e.message);
    }
  }

  $: clientBookings = viewing ? $bookings.filter((booking) => booking.clientName === viewing.name) : [];

  function contactWhatsApp() {
    window.open(`https://wa.me/${(viewing.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${viewing.name}, this is Travel Management.`)}`, '_blank');
  }

  function saveDocuments() {
    localStorage.setItem('tm_client_documents', JSON.stringify(documents));
  }

  function uploadDocument(event) {
    const file = event.target.files?.[0];
    if (!file || !viewing) return;
    const reader = new FileReader();
    reader.onload = () => {
      documents = { ...documents, [viewing.id]: [...(documents[viewing.id] || []), { name: file.name, type: file.type, data: reader.result }] };
      saveDocuments();
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  function removeDocument(index) {
    documents = { ...documents, [viewing.id]: documents[viewing.id].filter((_, i) => i !== index) };
    saveDocuments();
  }
</script>

<div class="page">
  <div class="crumbs"><button on:click={goBack}>← Back</button><span>/</span><button on:click={() => goTo('dashboard')}>Home</button></div>
  <div class="page-header">
    <div><h1 class="page-title">Clients</h1><div class="page-sub">Manage all your clients in one place</div></div>
    <button class="btn btn-primary" on:click={openAdd}>+ Add Client</button>
  </div>

  <div class="stat-row">
    <div class="card stat-card"><div class="stat-label">Total Clients</div><div class="stat-value">{$clients.length}</div></div>
    <div class="card stat-card"><div class="stat-label">Active</div><div class="stat-value">{$clients.filter(c=>c.status==='Active').length}</div></div>
    <div class="card stat-card"><div class="stat-label">Inactive</div><div class="stat-value">{$clients.filter(c=>c.status==='Inactive').length}</div></div>
    <div class="card stat-card"><div class="stat-label">VIP</div><div class="stat-value">{$clients.filter(c=>c.type==='VIP').length}</div></div>
  </div>

  <div class="tabs">
    {#each filters as f}
      <button class="tab-chip" class:active={filter===f.key} on:click={() => (filter=f.key)}>{f.key} ({f.count})</button>
    {/each}
  </div>

  <div class="card">
    <div class="table-wrap">
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {#each filtered as c}
            <tr>
              <td>{c.id}</td><td>{c.name}</td><td>{c.email}</td><td>{c.phone}</td>
              <td><span class="badge {statusClass(c.type)}">{c.type}</span></td>
              <td><span class="badge {statusClass(c.status)}">{c.status}</span></td>
              <td>
                <button class="btn-icon" title="View" on:click={() => (viewing = c)}>👁️</button>
                <button class="btn-icon" title="Edit" on:click={() => openEdit(c)}>✏️</button>
                <button class="btn-icon" title="Delete" on:click={() => remove(c.id)}>🗑️</button>
              </td>
            </tr>
          {:else}
            <tr><td colspan="7"><div class="empty-state">No clients found.</div></td></tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>

{#if showModal}
  <Modal title={editing ? 'Edit Client' : 'Add New Client'} on:close={() => (showModal=false)}>
    <div class="form-row"><label>Name</label><input bind:value={form.name} /></div>
    <div class="two-col">
      <div class="form-row"><label>Email</label><input bind:value={form.email} /></div>
      <div class="form-row"><label>Phone</label><input bind:value={form.phone} /></div>
    </div>
    <div class="two-col">
      <div class="form-row"><label>Type</label>
        <select bind:value={form.type}><option>Regular</option><option>New</option><option>VIP</option></select>
      </div>
      <div class="form-row"><label>Status</label>
        <select bind:value={form.status}><option>Active</option><option>Inactive</option></select>
      </div>
    </div>
    {#if $currentUser?.role !== 'agent'}
      <div class="form-row"><label>Assigned Agent</label>
        <select bind:value={form.assignedAgentId}><option value="">Unassigned</option>{#each $agents as agent}<option value={agent.id}>{agent.name}</option>{/each}</select>
      </div>
    {/if}
    <div class="passenger-head"><h3>Passengers</h3><button class="btn btn-outline" on:click={addPassenger}>+ Add Passenger</button></div>
    {#each form.passengers as passenger, index}
      <div class="passenger-row"><input placeholder="Full name" bind:value={passenger.name} /><input placeholder="Relation" bind:value={passenger.relation} /><input type="number" min="0" placeholder="Age" bind:value={passenger.age} /><button class="btn-icon" title="Remove passenger" on:click={() => removePassenger(index)}>🗑️</button></div>
    {/each}
    <div class="form-actions">
      <button class="btn btn-outline" on:click={() => (showModal=false)}>Cancel</button>
      <button class="btn btn-primary" on:click={save}>{editing ? 'Save Changes' : 'Add Client'}</button>
    </div>
  </Modal>
{/if}

{#if viewing}
  <Modal title="Client Details" on:close={() => (viewing=null)}>
    <div class="contact-actions"><a class="btn btn-outline" href={`mailto:${viewing.email}`}>✉ Email</a><button class="btn btn-outline" on:click={contactWhatsApp}>💬 WhatsApp</button></div>
    <div class="detail-row"><span>ID</span><b>{viewing.id}</b></div>
    <div class="detail-row"><span>Name</span><b>{viewing.name}</b></div>
    <div class="detail-row"><span>Email</span><b>{viewing.email}</b></div>
    <div class="detail-row"><span>Phone</span><b>{viewing.phone}</b></div>
    <div class="detail-row"><span>Type</span><b>{viewing.type}</b></div>
    <div class="detail-row"><span>Status</span><b>{viewing.status}</b></div>
    <h3 class="section-title">Passengers ({parsePassengers(viewing.passengers).length})</h3>
    {#each parsePassengers(viewing.passengers) as passenger}
      <div class="history-row"><span>{passenger.name}<small>{passenger.relation || 'Family / friend'}{passenger.age ? ` · ${passenger.age} years` : ''}</small></span></div>
    {:else}<div class="empty-state compact">No additional passengers added.</div>{/each}
    <h3 class="section-title">Travel History</h3>
    {#each clientBookings as booking}
      <div class="history-row"><span>{booking.tripName}<small>{booking.travelDate}</small></span><b>{booking.status}<small>₹{Number(booking.amount).toLocaleString('en-IN')}</small></b></div>
    {:else}<div class="empty-state compact">No booking history yet.</div>{/each}
    <h3 class="section-title">Documents</h3>
    <label class="upload-box">📎 Upload passport, ticket or voucher<input type="file" accept="image/*,.pdf,.doc,.docx" on:change={uploadDocument} /></label>
    {#each documents[viewing.id] || [] as document, index}
      <div class="document-row"><a href={document.data} download={document.name}>{document.name}</a><button class="btn-icon" title="Remove document" on:click={() => removeDocument(index)}>🗑️</button></div>
    {:else}<div class="empty-state compact">No documents uploaded.</div>{/each}
  </Modal>
{/if}

<style>
.detail-row{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border);font-size:14px;}
.detail-row:last-child{border-bottom:none;}
.contact-actions{display:flex;gap:8px;margin-bottom:12px;}
.section-title{font-size:14px;margin:18px 0 8px;}
.history-row,.document-row{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid var(--border);font-size:13px;}
.history-row span,.history-row b{display:flex;flex-direction:column;gap:3px;}
.history-row b{text-align:right;}
.history-row small{color:var(--text-dim);font-weight:400;}
.upload-box{display:block;border:1px dashed var(--border);border-radius:8px;padding:12px;text-align:center;color:var(--text-dim);font-size:13px;cursor:pointer;}
.upload-box input{display:none;}
.document-row a{color:var(--teal);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.compact{padding:10px 0;font-size:12px;}
.passenger-head{display:flex;align-items:center;justify-content:space-between;margin:18px 0 8px;}
.passenger-head h3{font-size:14px;margin:0;}
.passenger-row{display:grid;grid-template-columns:1.5fr 1fr .6fr auto;gap:7px;margin-bottom:8px;align-items:center;}
.passenger-row input{min-width:0;padding:9px 10px;border:1px solid var(--border);border-radius:8px;}
@media (max-width:640px){.passenger-row{grid-template-columns:1fr 1fr;}.passenger-row input:nth-child(3){grid-column:1;}}
</style>
