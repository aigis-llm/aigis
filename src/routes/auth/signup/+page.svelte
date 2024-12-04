<script lang="ts">
	let password = $state("")
	let passwordconfirm = $state("")
</script>

<div class="h-screen flex flex-col items-center justify-center px-4">
	<h1>Sign Up</h1>
	<form method="POST">
		<label class="flex flex-row w-full py-2">
			<p class="flex-1 text-center px-2">Email</p>
			<input
				name="email"
				type="email"
				autocomplete="username"
				class="flex-initial border-2 border-solid border-[--ctp-surface1] focus:outline-solid focus:outline-1 focus:outline-[--ctp-surface2] focus:border-[--ctp-surface2] rounded-lg color-[--ctp-text] bg-[--ctp-surface0]"
			/>
		</label>
		<label class="flex flex-row w-full py-2">
			<p class="flex-1 text-center px-2">Password</p>
			<input
				name="password"
				bind:value={password}
				type="password"
				autocomplete="new-password"
				class="flex-initial border-2 border-solid border-[--ctp-surface1] focus:outline-solid focus:outline-1 focus:outline-[--ctp-surface2] focus:border-[--ctp-surface2] rounded-lg color-[--ctp-text] bg-[--ctp-surface0]"
			/>
		</label>
		<label class="flex flex-row w-full py-2">
			<p class="flex-1 text-center px-2">Confirm Password</p>
			<input
				name="password-confirm"
				bind:value={passwordconfirm}
				type="password"
				autocomplete="new-password"
				class="flex-initial border-2 border-solid border-[--ctp-surface1] focus:outline-solid focus:outline-1 focus:outline-[--ctp-surface2] focus:border-[--ctp-surface2] rounded-lg color-[--ctp-text] bg-[--ctp-surface0]"
			/>
		</label>
		{#if password !== passwordconfirm}
			<p class="flex flex-row w-full py-2 color-[--ctp-yellow]">The passwords do not match!</p>
		{/if}
		<div class="flex flex-row justify-center">
			<button class="w-24 border-0 rounded-lg color-[--ctp-text] bg-[--ctp-surface0]">
				Sign Up
			</button>
		</div>
	</form>
</div>
