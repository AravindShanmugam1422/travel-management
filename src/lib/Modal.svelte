<script>
  export let title = '';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  function close() { dispatch('close'); }
</script>

<div class="modal-backdrop" on:click|self={close}>
  <div class="modal">
    <div class="modal-title">
      <span>{title}</span>
      <button class="btn-icon" on:click={close}>✕</button>
    </div>
    <slot></slot>
  </div>
</div>
