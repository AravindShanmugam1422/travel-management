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
  .toast-stack{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2000;display:flex;flex-direction:column;gap:10px;max-width:min(420px,calc(100vw - 30px));}
  .toast{display:flex;align-items:center;gap:10px;background:var(--navy);color:#fff;border:1px solid rgba(255,255,255,.15);border-radius:14px;padding:18px 20px;box-shadow:0 18px 50px rgba(15,23,42,.3);font-size:15px;min-width:280px;animation:toast-in .2s ease-out;}
  .toast-icon{width:22px;height:22px;border-radius:50%;background:var(--teal);display:flex;align-items:center;justify-content:center;font-weight:800;flex-shrink:0;}
  .toast-close{margin-left:auto;border:0;background:transparent;color:#cbd5e1;font-size:20px;line-height:1;cursor:pointer;padding:0 2px;}
  .toast-close:hover{color:#fff;}
  @keyframes toast-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @media (max-width:640px){.toast-stack{width:calc(100vw - 30px);}.toast{min-width:0;}}
</style>