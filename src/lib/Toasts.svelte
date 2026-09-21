<script>
  import { toasts } from './stores.js';

  function dismiss(id) {
    toasts.update((items) => items.filter((item) => item.id !== id));
  }
</script>

<div class="toast-stack" aria-live="polite">
  {#each $toasts as toast (toast.id)}
    <div class="toast">
      <span class="toast-icon">✓</span>
      <span>{toast.text}</span>
      <button class="toast-close" aria-label="Dismiss notification" on:click={() => dismiss(toast.id)}>×</button>
    </div>
  {/each}
</div>

<style>
  .toast-stack{position:fixed;right:22px;bottom:22px;z-index:2000;display:flex;flex-direction:column;gap:10px;max-width:min(380px,calc(100vw - 30px));}
  .toast{display:flex;align-items:center;gap:10px;background:var(--navy);color:#fff;border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:12px 13px;box-shadow:0 12px 30px rgba(15,23,42,.25);font-size:13px;animation:toast-in .2s ease-out;}
  .toast-icon{width:22px;height:22px;border-radius:50%;background:var(--teal);display:flex;align-items:center;justify-content:center;font-weight:800;flex-shrink:0;}
  .toast-close{margin-left:auto;border:0;background:transparent;color:#cbd5e1;font-size:20px;line-height:1;cursor:pointer;padding:0 2px;}
  .toast-close:hover{color:#fff;}
  @keyframes toast-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @media (max-width:640px){.toast-stack{right:12px;bottom:12px;}}
</style>