<script>
  import { notifications, currentUser, darkMode, toggleDarkMode, goHome } from './stores.js';
  import { apiPost, apiPut, apiDelete } from './api.js';
  import { createEventDispatcher } from 'svelte';

  export let onSearch = () => {};
  let query = '';
  let showNotif = false;
  let showReminderList = false;
  let showReminder = false;
  let editingReminder = null;
  let showUserMenu = false;
  let showAddAgent = false;
  let agentName = '', agentUsername = '', agentPassword = '';
  let agentMsg = '';
  let reminderText = '', reminderTime = '';

  const dispatch = createEventDispatcher();

  function handleInput() {
    onSearch(query);
  }

  function logout() {
    currentUser.set(null);
  }

  async function addAgent() {
    if (!agentName || !agentUsername || !agentPassword) {
      agentMsg = 'Please fill all fields.';
      return;
    }
    try {
      await apiPost('/agents', { name: agentName, username: agentUsername, password: agentPassword });
      agentMsg = 'Agent account created successfully.';
      agentName = ''; agentUsername = ''; agentPassword = '';
    } catch (e) {
      agentMsg = e.message;
    }
  }

  async function addReminder() {
    if (!reminderText.trim()) return;
    try {
      const payload = { text: reminderText.trim(), time: reminderTime || 'Just now', kind: 'reminder' };
      if (editingReminder) {
        const updated = await apiPut(`/notifications/${editingReminder}`, payload);
        notifications.update((list) => list.map((item) => item.id === editingReminder ? updated : item));
      } else {
        const reminder = await apiPost('/notifications', payload);
        notifications.update((list) => [reminder, ...list]);
      }
      reminderText = ''; reminderTime = ''; showReminder = false; showReminderList = false;
      editingReminder = null;
    } catch (e) {
      agentMsg = e.message;
    }
  }

  function openReminderEditor(reminder) {
    editingReminder = reminder.id;
    reminderText = reminder.text;
    reminderTime = reminder.time;
    showNotif = false;
    showReminderList = false;
    showReminder = true;
  }

  async function removeReminder(id) {
    if (!confirm('Delete this reminder?')) return;
    try {
      await apiDelete(`/notifications/${id}`);
      notifications.update((list) => list.filter((item) => item.id !== id));
    } catch (e) {
      agentMsg = e.message;
    }
  }

  async function clearNotifications() {
    if (!confirm('Clear all notifications? Reminders will stay safe.')) return;
    try {
      await apiDelete('/notifications?kind=notification');
      notifications.update((list) => list.filter((item) => item.kind !== 'notification'));
      showNotif = false;
    } catch (e) {
      agentMsg = e.message;
    }
  }
</script>

<header class="topbar">
  <div class="search-box">
    <span>🔍</span>
    <input placeholder="Search clients, trips, bookings..." bind:value={query} on:input={handleInput} />
  </div>

  <div class="topbar-right">
    {#if $currentUser && ($currentUser.role === 'manager' || $currentUser.role === 'head_office')}
      <button class="btn btn-outline" on:click={() => (showAddAgent = true)}>+ Add Agent</button>
    {/if}

    <button class="btn btn-outline reminder-btn" on:click={() => (showReminder = true)}>＋ Reminder</button>
    <button class="btn btn-outline reminder-list-btn" on:click={() => (showReminderList = !showReminderList)}>🗓 Reminders</button>
    <button class="icon-btn" on:click={() => (showNotif = !showNotif)} title="Notifications">
      🔔
      {#if $notifications.filter((item) => item.kind === 'notification').length}
        <span class="dot-badge">{$notifications.filter((item) => item.kind === 'notification').length}</span>
      {/if}
    </button>
    <button class="icon-btn" on:click={goHome} title="Home">🏠</button>
    <button class="icon-btn" on:click={toggleDarkMode} title="Toggle dark mode">{$darkMode ? '☀️' : '🌙'}</button>

    {#if $currentUser}
      <button class="user-chip" on:click={() => (showUserMenu = !showUserMenu)}>
        <span class="avatar-sm">{$currentUser.name.charAt(0)}</span>
        <span class="user-chip-text">
          <b>{$currentUser.name}</b>
          <small>{$currentUser.role === 'head_office' ? 'Head Office' : $currentUser.role === 'manager' ? 'Manager' : 'Agent'}</small>
        </span>
      </button>
    {/if}
  </div>

  {#if showNotif}
    <div class="dropdown notif-dropdown">
      <div class="dropdown-title"><span>Notifications</span><button class="clear-btn" on:click={clearNotifications}>Clear</button></div>
      {#each $notifications.filter((item) => item.kind === 'notification') as n}
        <div class="notif-item">
          <div class="notif-content"><div>{n.text}</div><small>{n.time}</small></div>
        </div>
      {:else}
        <div class="empty-state">No notifications</div>
      {/each}
    </div>
  {/if}

  {#if showReminderList}
    <div class="dropdown reminder-dropdown">
      <div class="dropdown-title">Reminders</div>
      {#each $notifications.filter((item) => item.kind === 'reminder') as n}
        <div class="notif-item">
          <div class="notif-content"><div>{n.text}</div><small>{n.time}</small></div>
          <div class="notif-actions"><button class="btn-icon" title="Edit reminder" on:click={() => openReminderEditor(n)}>✏️</button><button class="btn-icon" title="Delete reminder" on:click={() => removeReminder(n.id)}>🗑️</button></div>
        </div>
      {:else}
        <div class="empty-state">No reminders</div>
      {/each}
    </div>
  {/if}

  {#if showUserMenu}
    <div class="dropdown user-dropdown">
      <button class="dropdown-item" on:click={logout}>Logout</button>
    </div>
  {/if}
</header>

{#if showAddAgent}
  <div class="modal-backdrop" on:click|self={() => (showAddAgent = false)}>
    <div class="modal">
      <div class="modal-title">
        <span>Add Agent</span>
        <button class="btn-icon" on:click={() => (showAddAgent = false)}>✕</button>
      </div>
      <div class="form-row"><label>Name</label><input bind:value={agentName} /></div>
      <div class="form-row"><label>Username</label><input bind:value={agentUsername} /></div>
      <div class="form-row"><label>Password</label><input type="password" bind:value={agentPassword} /></div>
      {#if agentMsg}<div class="msg">{agentMsg}</div>{/if}
      <div class="form-actions">
        <button class="btn btn-outline" on:click={() => (showAddAgent = false)}>Close</button>
        <button class="btn btn-primary" on:click={addAgent}>Create Agent</button>
      </div>
    </div>
  </div>
{/if}

{#if showReminder}
  <div class="modal-backdrop" on:click|self={() => (showReminder = false)}>
    <div class="modal">
      <div class="modal-title"><span>{editingReminder ? 'Edit Reminder' : 'Add Reminder'}</span><button class="btn-icon" on:click={() => { showReminder = false; editingReminder = null; }}>✕</button></div>
      <div class="form-row"><label>Reminder</label><input bind:value={reminderText} placeholder="e.g. Payment due for Ravi Kumar" /></div>
      <div class="form-row"><label>Date / Time</label><input bind:value={reminderTime} placeholder="e.g. 20 Sep 2026, 10:00 AM" /></div>
      <div class="form-actions"><button class="btn btn-outline" on:click={() => { showReminder = false; editingReminder = null; }}>Cancel</button><button class="btn btn-primary" on:click={addReminder}>{editingReminder ? 'Save Reminder' : 'Add Reminder'}</button></div>
    </div>
  </div>
{/if}

<style>
.topbar{
  display:flex;align-items:center;justify-content:space-between;
  padding:14px 26px;background:var(--card);border-bottom:1px solid var(--border);
  position:sticky;top:0;z-index:50;gap:16px;
}
.topbar-right{display:flex;align-items:center;gap:12px;position:relative;}
.icon-btn{
  background:none;border:1px solid var(--border);width:38px;height:38px;border-radius:9px;
  font-size:16px;position:relative;display:flex;align-items:center;justify-content:center;
}
.icon-btn:hover{background:#f1f5f9;}
.dot-badge{
  position:absolute;top:-4px;right:-4px;background:var(--red);color:#fff;
  font-size:10px;border-radius:50%;width:16px;height:16px;display:flex;align-items:center;justify-content:center;
}
.user-chip{display:flex;align-items:center;gap:8px;background:#f8fafc;border:1px solid var(--border);border-radius:10px;padding:6px 10px;}
.avatar-sm{width:28px;height:28px;border-radius:50%;background:var(--teal);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;}
.user-chip-text{display:flex;flex-direction:column;align-items:flex-start;font-size:12px;line-height:1.3;}
.dropdown{
  position:absolute;top:52px;right:0;background:var(--card);border:1px solid var(--border);
  border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.12);min-width:260px;z-index:60;
}
.notif-dropdown{max-height:300px;overflow-y:auto;}
.reminder-dropdown{max-height:300px;overflow-y:auto;right:110px;}
.dropdown-title{padding:12px 16px;font-weight:700;border-bottom:1px solid var(--border);font-size:14px;}
.dropdown-title{display:flex;align-items:center;justify-content:space-between;}
.clear-btn{border:0;background:transparent;color:var(--red);font-size:12px;font-weight:700;cursor:pointer;}
.notif-item{padding:10px 16px;border-bottom:1px solid var(--border);font-size:13px;}
.notif-item small{color:var(--text-dim);}
.notif-item{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;}
.notif-content{min-width:0;flex:1;}
.notif-actions{display:flex;gap:2px;flex-shrink:0;}
.dropdown-item{width:100%;text-align:left;padding:12px 16px;background:none;border:none;font-size:14px;}
.dropdown-item:hover{background:#f1f5f9;}
.msg{font-size:13px;color:var(--teal-dark);margin-top:-6px;margin-bottom:10px;}
.reminder-btn{white-space:nowrap;}

@media (max-width:640px){
  .topbar{padding:10px 12px;gap:8px;}
  .search-box{min-width:0;padding:7px 9px;}
  .search-box input{font-size:12px;}
  .topbar-right{gap:6px;}
  .topbar-right > .btn-outline:not(.reminder-btn){display:none;}
  .reminder-btn{font-size:11px;padding:7px 8px;}
  .reminder-list-btn{font-size:11px;padding:7px 8px;}
  .user-chip{padding:5px;}
  .user-chip-text{display:none;}
  .dropdown{min-width:220px;}
}
</style>
