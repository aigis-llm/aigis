<script lang="ts">
	import type { LayoutData } from "./$types"
	import { preferences } from "$lib/stores"
	import type { Snippet } from "svelte"
	import Select from "$lib/Select.svelte"

	let { data }: { data: LayoutData; children: Snippet } = $props()

	const flavors = [
		{ value: "latte", label: "Latte" },
		{ value: "frappe", label: "Frappé" },
		{ value: "macchiato", label: "Macchiato" },
		{ value: "mocha", label: "Mocha" },
	]

	const loadBackendData = async () => {
		return await (await data.backend_fetch(import.meta.env.AIGIS_BACKEND_URL)).text()
	}
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<div class="px-3">
	<Select options={flavors} bind:selected={$preferences.theme} class="w-30"></Select>
</div>
<p>Illegal</p>
<p>3.14</p>
<p>
	0.45, 0.91. +0.08<br />
	1.00; 9.44, −0.13<br />
	0:00. 1.13; ~7.12
</p>
<code class="font-mono color-[--ctp-rosewater]">
	0.45, 0.91. +0.08<br />
	1.00; 9.44, −0.13<br />
	0:00. 1.13; ~7.12</code
>
<p>{data.session?.access_token}</p>
{#await loadBackendData() then backend_data}
	<p>{backend_data}</p>
{/await}
