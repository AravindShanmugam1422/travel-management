<script>
  import { currentUser } from '../stores.js';
  import { apiPost } from '../api.js';

  let mode = 'login'; // 'login' | 'signup'
  let username = '', password = '', name = '', confirm = '';
  let error = '', info = '', loading = false;

  async function doLogin() {
    error = ''; loading = true;
    try {
      const u = await apiPost('/auth/login', { username, password });
      currentUser.set(u);
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  async function doSignup() {
    error = ''; info = '';
    if (!name || !username || !password || !confirm) {
      error = 'Please fill all fields.';
      return;
    }
    if (password !== confirm) {
      error = 'Passwords do not match.';
      return;
    }
    loading = true;
    try {
      await apiPost('/auth/signup', { name, username, password });
      info = 'Account created! Your access role was assigned automatically. You can now log in.';
      mode = 'login';
      name = ''; confirm = '';
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="login-page">
  <div class="login-left">
    <div class="brand-row">
      <div class="brand-icon">✈️</div>
      <div>
        <div class="brand-title">Travel Management</div>
        <div class="brand-sub">Plan &middot; Book &middot; Explore</div>
      </div>
    </div>
    <h1>Your Journey<br/>Our Management</h1>
    <p>Simplify travel operations with a powerful and easy-to-use platform.</p>
    <div class="feature-row">
      <div class="feature"><span>👥</span>Manage Clients &amp; Bookings</div>
      <div class="feature"><span>🗺️</span>Track Trips &amp; Itineraries</div>
      <div class="feature"><span>💳</span>Handle Payments &amp; Expenses</div>
    </div>
  </div>

  <div class="login-right">
    <div class="login-card">
      {#if mode === 'login'}
        <h2>Welcome Back</h2>
        <p class="sub">Login to your account</p>
      {:else}
        <h2>Create Account</h2>
        <p class="sub">Sign up to get started</p>
      {/if}

      {#if mode === 'signup'}
        <div class="form-row">
          <label>Full Name</label>
          <input bind:value={name} placeholder="Enter your name" />
        </div>
      {/if}

      <div class="form-row">
        <label>Username</label>
        <input bind:value={username} placeholder="Enter your username" />
      </div>
      <div class="form-row">
        <label>Password</label>
        <input type="password" bind:value={password} placeholder="Enter your password" />
      </div>
      {#if mode === 'signup'}
        <div class="form-row">
          <label>Confirm Password</label>
          <input type="password" bind:value={confirm} placeholder="Confirm your password" />
        </div>
      {/if}

      {#if error}<div class="error">{error}</div>{/if}
      {#if info}<div class="info">{info}</div>{/if}

      {#if mode === 'login'}
        <button class="btn btn-primary full" on:click={doLogin}>Login</button>
        <div class="switch">Don't have an account? <button on:click={() => { mode='signup'; error=''; info=''; }}>Sign Up</button></div>
      {:else}
        <button class="btn btn-primary full" on:click={doSignup}>Sign Up</button>
        <div class="switch">Already have an account? <button on:click={() => { mode='login'; error=''; info=''; }}>Login</button></div>
      {/if}

      <div class="demo-hint">Demo login &mdash; Head Office: <b>aravind</b> / <b>admin123</b></div>
    </div>
  </div>
</div>

<style>
.login-page{display:flex;min-height:100vh;}
.login-left{
  flex:1.1;background:linear-gradient(160deg,var(--navy),#062033 70%);
  color:#fff;padding:56px;display:flex;flex-direction:column;justify-content:center;
  position:relative;overflow:hidden;
}
.login-left::after{
  content:'';position:absolute;right:-80px;bottom:-80px;width:320px;height:320px;
  background:radial-gradient(circle,rgba(13,148,136,.35),transparent 70%);border-radius:50%;
}
.brand-row{display:flex;align-items:center;gap:12px;margin-bottom:44px;}
.brand-icon{width:40px;height:40px;background:var(--teal);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:19px;}
.brand-title{font-weight:700;font-size:17px;}
.brand-sub{font-size:12px;color:#94a3b8;}
h1{font-size:40px;line-height:1.15;margin:0 0 16px;font-weight:800;}
.login-left p{color:#cbd5e1;font-size:15px;max-width:420px;margin-bottom:36px;}
.feature-row{display:flex;flex-direction:column;gap:14px;}
.feature{display:flex;align-items:center;gap:10px;font-size:14px;color:#e2e8f0;}
.feature span{width:34px;height:34px;background:rgba(255,255,255,.08);border-radius:9px;display:flex;align-items:center;justify-content:center;}
.login-right{flex:1;display:flex;align-items:center;justify-content:center;padding:40px;background:#f4f7fb;}
.login-card{width:100%;max-width:400px;background:#fff;border-radius:16px;padding:32px;box-shadow:0 10px 40px rgba(16,24,40,.08);}
.login-card h2{margin:0 0 4px;font-size:22px;}
.sub{color:var(--text-dim);font-size:13.5px;margin:0 0 20px;}
.role-tabs{display:flex;gap:8px;margin-bottom:20px;}
.role-tabs button{flex:1;padding:9px 0;border-radius:8px;border:1px solid var(--border);background:#fff;font-size:13px;font-weight:600;color:var(--text-dim);}
.role-tabs button.active{background:var(--navy);color:#fff;border-color:var(--navy);}
.full{width:100%;justify-content:center;margin-top:6px;}
.switch{text-align:center;font-size:13px;color:var(--text-dim);margin-top:16px;}
.switch button{background:none;border:none;color:var(--teal);font-weight:700;}
.error{background:#fef2f2;color:var(--red);font-size:12.5px;padding:9px 12px;border-radius:8px;margin-bottom:10px;}
.info{background:#ecfdf5;color:var(--teal-dark);font-size:12.5px;padding:9px 12px;border-radius:8px;margin-bottom:10px;}
.hint{font-size:12px;color:var(--text-dim);margin:-6px 0 14px;}
.demo-hint{margin-top:18px;font-size:11.5px;color:#94a3b8;text-align:center;}
@media (max-width:860px){ .login-left{display:none;} }
</style>
