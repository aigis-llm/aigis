<script lang="ts">
	import { classList } from "svelte-body"
	import { preferences } from "../stores"
	import "$lib/reset.css"
	import "virtual:uno.css"

	let { children } = $props()
</script>

<svelte:body use:classList={`theme-${$preferences.theme}`} />

{@render children()}
