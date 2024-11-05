<script lang="ts">
	import type { LayoutData } from "./$types"
	import { preferences } from "../stores"
	import type { Snippet } from "svelte"

	let { data, children }: { data: LayoutData; children: Snippet } = $props()
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<select bind:value={$preferences.theme}>
	<option value="latte">Latte</option>
	<option value="frappe">Frappe</option>
	<option value="macchiato">Machhiato</option>
	<option value="mocha">Mocha</option>
</select>
<p>Illegal</p>
<p>3.14</p>
<p>
	0.45, 0.91. +0.08<br />
	1.00; 9.44, −0.13<br />
	0:00. 1.13; ~7.12
</p>
<code class="font-mono color-ctp-{$preferences.theme}-rosewater">
	0.45, 0.91. +0.08<br />
	1.00; 9.44, −0.13<br />
	0:00. 1.13; ~7.12</code
>
