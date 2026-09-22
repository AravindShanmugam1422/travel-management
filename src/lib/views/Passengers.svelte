<script>
  import { clients } from '../data.js';
  import { goBack, goTo } from '../stores.js';

  export let searchQuery = '';
  let filter = 'All';

  function parsePassengers(value) {
    if (Array.isArray(value)) return value;
    try { return value ? JSON.parse(value) : []; } catch (e) { return []; }
  }

  $: passengerRows = $clients.flatMap((client) => parsePassengers(client.passengers).map((passenger, index) => ({
    ...passenger, client, key: `${client.id}-${index}`
  })));
  $: filtered = passengerRows.filter((passenger) => {
    const q = (searchQuery || '').toLowerCase();
    return (filter === 'All' || passenger.relation === filter) && (!q || [passenger.name, passenger.relation, passenger.client.name, passenger.client.email].some((value) => String(value || '').toLowerCase().includes(q)));
  });
  $: relations = [...new Set(passengerRows.map((item) => item.relation).filter(Boolean))];
</script>

<div class="page">
  <div class="crumbs"><button on:click={goBack}>← Back</button><span>/</span><button on:click={() => goTo('dashboard')}>Home</button></div>
  <div class="page-header">
    <div><h1 class="page-title">Passengers</h1><div class="page-sub">All travellers added under your clients</div></div>
    <button class="btn btn-primary" on:click={() => goTo('clients')}>+ Add Passenger from Client</button>
  </div>

  <div class="stat-row">
    <div class="card stat-card"><div class="stat-label">Total Passengers</div><div class="stat-value">{passengerRows.length}</div></div>
    <div class="card stat-card"><div class="stat-label">Client Accounts</div><div class="stat-value">{$clients.filter((client) => parsePassengers(client.passengers).length).length}</div></div>
  </div>

  <div class="tabs"><button class:active={filter === 'All'} class="tab-chip" on:click={() => filter = 'All'}>All ({passengerRows.length})</button>{#each relations as relation}<button class:active={filter === relation} class="tab-chip" on:click={() => filter = relation}>{relation}</button>{/each}</div>

  <div class="card"><div class="table-wrap"><table>
    <thead><tr><th>Passenger</th><th>Relation</th><th>Age</th><th>Client</th><th>Client Contact</th></tr></thead>
    <tbody>{#each filtered as passenger}
      <tr><td><button class="detail-link" on:click={() => goTo('clients', { viewClientId: passenger.client.id })}>{passenger.name || 'Unnamed passenger'}</button></td><td>{passenger.relation || '—'}</td><td>{passenger.age || '—'}</td><td><button class="detail-link" on:click={() => goTo('clients', { viewClientId: passenger.client.id })}>{passenger.client.name}</button></td><td>{passenger.client.phone || passenger.client.email || '—'}</td></tr>
    {:else}<tr><td colspan="5"><div class="empty-state">No passengers found. Add them while creating or editing a client.</div></td></tr>{/each}</tbody>
  </table></div></div>
</div>

<style>.detail-link{border:0;background:none;padding:0;color:var(--teal);font:inherit;font-weight:700;text-align:left;}.detail-link:hover{text-decoration:underline;}</style>
