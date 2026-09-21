<script>
  import { onMount } from 'svelte';
  import { apiGet, apiPut, apiDelete } from '../api.js';
  import { notify } from '../stores.js';
  import Modal from '../Modal.svelte';

  let users = [];
  let resetRequests = [];
  let loading = true;
  let error = '';
  let editing = null;
  let form = { name:'', username:'', email:'', phone:'', role:'agent', managerId:'' };

  onMount(loadUsers);

  async function loadUsers() {
    try { users = await apiGet('/users?manage=1'); resetRequests = await apiGet('/users/reset-requests'); }
    catch (e) { error = e.message; }
    finally { loading = false; }
  }

  async function handleReset(requestId, action) {
    try {
      const result = await apiPut('/users/reset-requests', { requestId, action });
      resetRequests = resetRequests.map((request) => request.id === requestId ? { ...request, status: action === 'reject' ? 'rejected' : 'approved' } : request);
      if (result.temporaryPassword) alert(`Temporary password: ${result.temporaryPassword}\nValid for 15 minutes. Share it securely with the user.`);
      notify(action === 'reject' ? 'Reset request rejected' : 'Reset approved; temporary password generated');
    } catch (e) { error = e.message; }
  }

  function openEdit(user) {
    editing = user.id;
    form = { name:user.name, username:user.username, email:user.email || '', phone:user.phone || '', role:user.role, managerId:user.managerId || '' };
  }

  async function save() {
    try {
      const updated = await apiPut(`/users/${editing}`, form);
      users = users.map((user) => user.id === editing ? { ...user, ...updated } : user);
      editing = null;
      notify('User account updated ✨');
    } catch (e) { error = e.message; }
  }

  async function remove(user) {
    if (!confirm(`Permanently delete ${user.name}'s account? This cannot be undone.`)) return;
    try {
      await apiDelete(`/users/${user.id}`);
      users = users.filter((item) => item.id !== user.id);
      notify(`${user.name}'s account deleted`);
    } catch (e) { error = e.message; }
  }
</script>

<div class="page">
  <div class="crumbs"><button>🔐 Admin</button><span>/</span><span>User Accounts</span></div>
  <div class="page-header">
    <div><h1 class="page-title">User Accounts</h1><div class="page-sub">View, edit, or permanently remove manager and agent accounts.</div></div>
  </div>

  {#if error}<div class="error">{error}</div>{/if}
  {#if loading}<div class="card empty-state">Loading user accounts...</div>
  {:else}<div class="card"><div class="table-wrap"><table>
    <thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Email</th><th>Phone</th><th>Actions</th></tr></thead>
    <tbody>{#each users as user}
      <tr><td><b>{user.name}</b></td><td>{user.username}</td><td><span class="badge {user.role === 'manager' ? 'badge-blue' : 'badge-green'}">{user.role === 'manager' ? 'Manager' : 'Agent'}</span></td><td>{user.email || '—'}</td><td>{user.phone || '—'}</td><td><button class="btn-icon" title="Edit account" on:click={() => openEdit(user)}>✏️</button><button class="btn-icon" title="Permanently delete account" on:click={() => remove(user)}>🗑️</button></td></tr>
    {:else}<tr><td colspan="6"><div class="empty-state">No manager or agent accounts found.</div></td></tr>{/each}</tbody>
  </table></div></div>{/if}

  <div class="card reset-card"><div class="card-head"><h3>Password Reset Requests</h3><span class="summary-note">Admin approval required</span></div>
    <div class="table-wrap"><table><thead><tr><th>User</th><th>Username</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody>
      {#each resetRequests as request}
        <tr><td><b>{request.name}</b></td><td>{request.username}</td><td>{request.role}</td><td><span class="badge {request.status === 'pending' ? 'badge-amber' : request.status === 'approved' ? 'badge-green' : 'badge-gray'}">{request.status}</span></td><td>{#if request.status === 'pending'}<button class="btn btn-primary small-btn" on:click={() => handleReset(request.id, 'approve')}>Approve</button><button class="btn btn-outline small-btn" on:click={() => handleReset(request.id, 'reject')}>Reject</button>{:else}<span class="muted">Completed</span>{/if}</td></tr>
      {:else}<tr><td colspan="5"><div class="empty-state compact">No password reset requests.</div></td></tr>{/each}
    </tbody></table></div>
  </div>
</div>

{#if editing}
  <Modal title="Edit User Account" on:close={() => (editing = null)}>
    <div class="form-row"><label>Name</label><input bind:value={form.name} /></div>
    <div class="form-row"><label>Username</label><input bind:value={form.username} /></div>
    <div class="two-col"><div class="form-row"><label>Email</label><input type="email" bind:value={form.email} /></div><div class="form-row"><label>Phone</label><input bind:value={form.phone} /></div></div>
    <div class="detail-row"><span>Role</span><b>{form.role === 'manager' ? 'Manager' : 'Agent'}</b></div>
    <div class="form-actions"><button class="btn btn-outline" on:click={() => (editing = null)}>Cancel</button><button class="btn btn-primary" on:click={save}>Save Changes</button></div>
  </Modal>
{/if}

<style>
.error{background:#fef2f2;color:var(--red);padding:10px 12px;border-radius:8px;margin-bottom:16px;font-size:13px;}.detail-row{display:flex;justify-content:space-between;padding:10px 0;border-top:1px solid var(--border);font-size:13px;}
.reset-card{margin-top:20px;}.card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}.card-head h3{margin:0;font-size:15px;}.summary-note,.muted{font-size:12px;color:var(--text-dim);}.small-btn{padding:6px 10px;font-size:12px;margin-right:5px;}
</style>
