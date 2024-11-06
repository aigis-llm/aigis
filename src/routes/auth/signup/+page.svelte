<script lang="ts">
	import { preferences } from "../../../stores"
	let password = $state("")
	let passwordconfirm = $state("")
</script>

<form method="POST">
	<label>
		Email
		<input name="email" type="email" />
	</label>
	<label>
		Password
		<input name="password" bind:value={password} type="password" />
	</label>
	<label>
		Confirm Password
		<input name="password-confirm" bind:value={passwordconfirm} type="password" />
	</label>
	{#if password !== passwordconfirm}
		<p class="color-ctp-{$preferences.theme}-yellow">The passwords do not match!</p>
	{/if}
	<button>Sign Up</button>
</form>
