<script>
	import { page } from '$app/state';
	let { data, children } = $props();

	const links = [
		{ href: '/dashboard', label: 'Overview' },
		{ href: '/dashboard/clients', label: 'Clients' },
		{ href: '/dashboard/trips', label: 'Trips' },
		{ href: '/dashboard/suppliers', label: 'Suppliers' },
		{ href: '/dashboard/expenses', label: 'My Expenses' }
	];
</script>

<div class="app-shell">
	<aside class="sidebar">
		<div class="brand">Travel Desk</div>
		<nav>
			{#each links as link}
				<a href={link.href} class:active={page.url.pathname === link.href}>{link.label}</a>
			{/each}
		</nav>
		<div class="who">
			Signed in as<br />
			<strong style="color:#fff">{data.agent?.name}</strong>
			<form method="POST" action="/logout" style="margin-top:0.6rem;">
				<button
					class="btn btn-secondary"
					style="width:100%;font-size:0.8rem;padding:0.4rem;color:#fff;border-color:rgba(255,255,255,0.4);background:transparent;"
				>Log out</button>
			</form>
		</div>
	</aside>
	<div class="main">
		{@render children()}
	</div>
</div>
