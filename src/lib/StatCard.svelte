<script>
  export let label = '';
  export let value = '';
  export let icon = '📊';
  export let color = '#0d9488';
  export let bg = '#ccfbf1';
  export let page = '';
  import { goTo } from './stores.js';
</script>

<button class="card stat-card" class:clickable={page} on:click={() => page && goTo(page)} aria-label={page ? `Open ${label}` : label}>
  <div class="stat-top">
    <div class="stat-icon" style="background:{bg};color:{color};">{icon}</div>
    <div class="stat-label">{label}</div>
  </div>
  <div class="stat-value">{value}</div>
</button>

<style>
.stat-card{width:100%;text-align:left;border:1px solid var(--border);}
.clickable{cursor:pointer;transition:transform .15s,box-shadow .15s;}
.clickable:hover{transform:translateY(-2px);box-shadow:0 7px 16px rgba(15,23,42,.10);border-color:var(--teal);}
</style>
