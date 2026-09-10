<script>
	import { enhance } from '$app/forms';
	let { form } = $props();
</script>

<svelte:head><title>Sign up — Travel Desk</title></svelte:head>

<div class="auth-shell">
	<div class="auth-card">
		<div class="brand">Travel Desk</div>
		<div class="tagline">Create your agent account</div>

		{#if form?.error}
			<div class="error-box">{form.error}</div>
		{/if}

		<form method="POST" use:enhance>
			<div class="field">
				<label for="name">Full name</label>
				<input id="name" name="name" type="text" required autocomplete="name" />
			</div>
			<div class="field">
				<label for="email">Email</label>
				<input id="email" name="email" type="email" required autocomplete="email" />
			</div>
			<div class="field">
				<label for="password">Password</label>
				<input id="password" name="password" type="password" required minlength="6" autocomplete="new-password" />
			</div>
			<button class="btn btn-primary" type="submit" style="width:100%;margin-top:0.5rem;">Create account</button>
		</form>

		<div class="auth-switch">Already have an account? <a href="/login">Log in</a></div>
	</div>
</div>
