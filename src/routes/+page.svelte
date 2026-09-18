<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { currentUser, currentPage, darkMode, loadNotifications } from '$lib/stores.js';
  import { loadAllData } from '$lib/data.js';
  import Login from '$lib/views/Login.svelte';
  import Sidebar from '$lib/Sidebar.svelte';
  import Topbar from '$lib/Topbar.svelte';
  import Dashboard from '$lib/views/Dashboard.svelte';
  import Clients from '$lib/views/Clients.svelte';
  import Trips from '$lib/views/Trips.svelte';
  import Itinerary from '$lib/views/Itinerary.svelte';
  import Calendar from '$lib/views/Calendar.svelte';
  import Suppliers from '$lib/views/Suppliers.svelte';
  import Bookings from '$lib/views/Bookings.svelte';
  import Payments from '$lib/views/Payments.svelte';
  import Expenses from '$lib/views/Expenses.svelte';
  import ServiceReview from '$lib/views/ServiceReview.svelte';

  let searchQuery = '';
  let loading = false;
  let loadError = '';

  function handleSearch(q) { searchQuery = q; }

  $: if ($currentUser) fetchAll();

  let fetchedFor = null;
  async function fetchAll() {
    if (fetchedFor === $currentUser.username) return;
    fetchedFor = $currentUser.username;
    loading = true;
    loadError = '';
    try {
      await Promise.all([loadAllData(), loadNotifications()]);
    } catch (e) {
      loadError = 'Could not load data from the database. Check your .env connection settings.';
    } finally {
      loading = false;
    }
  }
</script>

{#if !$currentUser}
  <Login />
{:else}
  <div class="app-shell">
    <Sidebar />
    <div class="main-col">
      <Topbar onSearch={handleSearch} />
      <div class="main-content">
        {#if loading}
          <div class="page"><div class="card empty-state">Loading your data...</div></div>
        {:else if loadError}
          <div class="page"><div class="card empty-state" style="color:#dc2626;">{loadError}</div></div>
        {:else if $currentPage === 'dashboard'}
          <Dashboard />
        {:else if $currentPage === 'clients'}
          <Clients {searchQuery} />
        {:else if $currentPage === 'trips'}
          <Trips {searchQuery} />
        {:else if $currentPage === 'itinerary'}
          <Itinerary />
        {:else if $currentPage === 'calendar'}
          <Calendar />
        {:else if $currentPage === 'suppliers'}
          <Suppliers {searchQuery} />
        {:else if $currentPage === 'bookings'}
          <Bookings {searchQuery} />
        {:else if $currentPage === 'payments'}
          <Payments {searchQuery} />
        {:else if $currentPage === 'expenses'}
          <Expenses {searchQuery} />
        {:else if $currentPage === 'service-review'}
          <ServiceReview />
        {/if}
      </div>
    </div>
  </div>
{/if}

<svelte:body class:dark-mode={$darkMode} />

<style>
.app-shell{display:flex;min-height:100vh;}
.main-col{flex:1;display:flex;flex-direction:column;min-width:0;}
.main-content{flex:1;}
</style>
