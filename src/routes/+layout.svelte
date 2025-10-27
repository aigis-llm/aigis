<script lang="ts">
	import { classList } from "svelte-body"
	import Navbar from "$lib/Navbar.svelte"
	import "$lib/reset.css"
	import { preferences } from "$lib/stores"
	import "virtual:uno.css"

	const { children } = $props()
</script>

<svelte:body use:classList={`theme-${$preferences.theme} font-sans`} />

<Navbar></Navbar>

{@render children()}
