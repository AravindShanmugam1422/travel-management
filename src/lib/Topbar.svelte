<script>
  import { notifications, currentUser, goHome, sidebarOpen } from './stores.js';
  import { apiPost } from './api.js';
  import { createEventDispatcher } from 'svelte';

  export let onSearch = () => {};
  let query = '';
  let showNotif = false;
  let showUserMenu = false;
  let showAddAgent = false;
  let agentName = '', agentUsername = '', agentPassword = '';
  let agentMsg = '';
  let notifWrap;
  let userWrap;

  const dispatch = createEventDispatcher();

  function handleWindowClick(e) {
    if (showNotif && notifWrap && !notifWrap.contains(e.target)) showNotif = false;
    if (showUserMenu && userWrap && !userWrap.contains(e.target)) showUserMenu = false;
  }

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
</script>

<svelte:window on:click={handleWindowClick} />

<header class="topbar">
  <button class="hamburger" on:click={() => sidebarOpen.set(!$sidebarOpen)} aria-label="Menu">☰</button>
  <div class="search-box">
    <span>🔍</span>
    <input placeholder="Search clients, trips, bookings..." bind:value={query} on:input={handleInput} />
  </div>

  <div class="topbar-right">
    {#if $currentUser && ($currentUser.role === 'manager' || $currentUser.role === 'head_office')}
      <button class="btn btn-outline" on:click={() => (showAddAgent = true)}>+ Add Agent</button>
    {/if}

    <div class="dropdown-wrap" bind:this={notifWrap}>
      <button class="icon-btn" on:click={() => (showNotif = !showNotif)}>
        🔔
        {#if $notifications.length}
          <span class="dot-badge">{$notifications.length}</span>
        {/if}
      </button>
      {#if showNotif}
        <div class="dropdown notif-dropdown">
          <div class="dropdown-title">Notifications</div>
          {#each $notifications as n}
            <div class="notif-item">
              <div>{n.text}</div>
              <small>{n.time}</small>
            </div>
          {:else}
            <div class="empty-state">No notifications</div>
          {/each}
        </div>
      {/if}
    </div>
    <button class="icon-btn" on:click={goHome} title="Home">🏠</button>

    {#if $currentUser}
      <div class="dropdown-wrap" bind:this={userWrap}>
        <button class="user-chip" on:click={() => (showUserMenu = !showUserMenu)}>
          <span class="avatar-sm">{$currentUser.name.charAt(0)}</span>
          <span class="user-chip-text">
            <b>{$currentUser.name}</b>
            <small>{$currentUser.role === 'head_office' ? 'Head Office' : $currentUser.role === 'manager' ? 'Manager' : 'Agent'}</small>
          </span>
        </button>
        {#if showUserMenu}
          <div class="dropdown user-dropdown">
            <button class="dropdown-item" on:click={logout}>Logout</button>
          </div>
        {/if}
      </div>
    {/if}
  </div>
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

<style>
.topbar{
  display:flex;align-items:center;justify-content:space-between;
  padding:14px 26px;background:#fff;border-bottom:1px solid var(--border);
  position:sticky;top:0;z-index:50;gap:16px;
}
.hamburger{
  display:none;background:none;border:1px solid var(--border);width:38px;height:38px;
  border-radius:9px;font-size:16px;flex:none;
}
.topbar-right{display:flex;align-items:center;gap:12px;position:relative;}
.dropdown-wrap{position:relative;display:flex;align-items:center;}
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
  position:absolute;top:52px;right:0;background:#fff;border:1px solid var(--border);
  border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.12);min-width:260px;z-index:60;
}
.notif-dropdown{max-height:300px;overflow-y:auto;}
.dropdown-title{padding:12px 16px;font-weight:700;border-bottom:1px solid var(--border);font-size:14px;}
.notif-item{padding:10px 16px;border-bottom:1px solid var(--border);font-size:13px;}
.notif-item small{color:var(--text-dim);}
.dropdown-item{width:100%;text-align:left;padding:12px 16px;background:none;border:none;font-size:14px;}
.dropdown-item:hover{background:#f1f5f9;}
.msg{font-size:13px;color:var(--teal-dark);margin-top:-6px;margin-bottom:10px;}

@media (max-width: 860px){
  .hamburger{display:flex;align-items:center;justify-content:center;}
}
@media (max-width: 640px){
  .topbar{padding:10px 14px;gap:8px;}
  .search-box{max-width:none;padding:7px 10px;}
  .user-chip-text{display:none;}
  .dropdown{min-width:220px;right:-40px;}
}
</style>