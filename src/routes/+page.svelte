<script lang="ts">
	import Select from "$lib/Select.svelte"
	import { preferences } from "$lib/stores"

	const flavors = [
		{ value: "latte", label: "Latte" },
		{ value: "frappe", label: "Frappé" },
		{ value: "macchiato", label: "Macchiato" },
		{ value: "mocha", label: "Mocha" },
	]

	let flavorLabel = $state(
		flavors.find(flavor => flavor.value === $preferences.theme) || {
			value: "ERROR",
			label: "ERROR",
		},
	)
	$effect(() => {
		$preferences.theme = flavorLabel.value
	})
</script>

<h1>Welcome to SvelteKit</h1>
<p>
	Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>
<div class="flavor-select-container">
	<Select options={flavors} bind:selected={flavorLabel} --width="7.5rem">Flavor:</Select>
</div>
<p>Illegal</p>
<p>3.14</p>
<p>
	0.45, 0.91. +0.08<br />
	1.00; 9.44, −0.13<br />
	0:00. 1.13; ~7.12
</p>
<code class="font-mono">
	0.45, 0.91. +0.08<br />
	1.00; 9.44, −0.13<br />
	0:00. 1.13; ~7.12
</code>

<style>
	.flavor-select-container {
		padding-left: 0.75rem;
		padding-right: 0.75rem;
	}
	code {
		color: var(--ctp-rosewater);
	}
</style>
