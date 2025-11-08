<script lang="ts">
	import { authClient } from "$lib/auth_client"

	const session = authClient.useSession()
</script>

<div>
	{#if $session.data}
		<p>
			Already logged in!
		</p>
	{:else}
		<form method="post" data-testid="signup-form">
			<h1>Sign up for Aigis</h1>
			<label for="email">Email</label>
			<input name="email" type="email" id="email">
			<label for="password">Password</label>
			<input name="password" type="password" id="password">
			<button>Sign up!</button>
		</form>
	{/if}
</div>

<style>
	@import "$lib/form.css";

	:global(html, body) {
		height: 100%;
	}

	div {
		display: flex;
		height: calc(100vh - 32px);
		align-items: center;
		justify-content: center;
		align-content: center;
	}
</style>
