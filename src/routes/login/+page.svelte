<script>
	import { enhance } from '$app/forms';
	let { form } = $props();
</script>

<svelte:head><title>Log in — Travel Desk</title></svelte:head>

<div class="auth-shell">
	<div class="auth-card">
		<div class="brand">Travel Desk</div>
		<div class="tagline">Log in to manage your trips</div>

		{#if form?.error}
			<div class="error-box">{form.error}</div>
		{/if}

		<form method="POST" use:enhance>
			<div class="field">
				<label for="email">Email</label>
				<input id="email" name="email" type="email" required autocomplete="email" />
			</div>
			<div class="field">
				<label for="password">Password</label>
				<input id="password" name="password" type="password" required autocomplete="current-password" />
			</div>
			<button class="btn btn-primary" type="submit" style="width:100%;margin-top:0.5rem;">Log in</button>
		</form>

		<div class="auth-switch">No account yet? <a href="/signup">Sign up</a></div>
	</div>
</div>
