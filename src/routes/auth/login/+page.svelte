<script lang="ts">
	import { preferences } from "$lib/stores"
</script>

<div class="h-screen flex flex-col items-center justify-center">
	<h1>Login</h1>
	<form method="POST">
		<label class="flex flex-row w-full py-2">
			<p class="flex-1 text-center px-2">Email</p>
			<input
				name="email"
				type="email"
				autocomplete="username"
				class="flex-initial border-2 border-solid border-[--ctp-surface1] rounded-lg color-[--ctp-text] bg-[--ctp-surface0]"
			/>
		</label>
		<label class="flex flex-row w-full py-2">
			<p class="flex-1 text-center px-2">Password</p>
			<input
				name="password"
				type="password"
				autocomplete="current-password"
				class="flex-initial border-2 border-solid border-[--ctp-surface1] rounded-lg color-[--ctp-text] bg-[--ctp-surface0]"
			/>
		</label>
		<div class="flex flex-row justify-center">
			<button
				class="w-24 border-0 rounded-lg color-[--ctp-text] bg-[--ctp-surface0]"
				>Log in</button
			>
		</div>
	</form>
</div>
