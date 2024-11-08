<script lang="ts">
	import { preferences } from "$lib/stores"
</script>

<div class="h-screen flex flex-col items-center justify-center">
<form method="POST">
	<label class="flex flex-row w-full py-2">
		<p class="flex-1 text-center px-2">Email</p>
		<input name="email" type="email" autocomplete="username" class="flex-2 border rounded-lg color-ctp-{$preferences.theme}-overlay0 bg-ctp-{$preferences.theme}-surface0"/>
	</label>
	<label class="flex flex-row w-full py-2">
		<p class="flex-1 text-center px-2">Password</p>
		<input name="password" type="password" autocomplete="current-password" class="flex-2 color-ctp-{$preferences.theme}-overlay0 bg-ctp-{$preferences.theme}-surface0"/>
	</label>
	<div class="flex flex-row justify-center">
		<button class="w-24 color-ctp-{$preferences.theme}-overlay0 bg-ctp-{$preferences.theme}-surface0">Log in</button>
	</div>
</form>
</div>