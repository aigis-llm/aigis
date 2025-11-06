<script lang="ts">
	import { classList } from "svelte-body"
	import { preferences } from "$lib/stores"
	import "$lib/reset.css"
	import "virtual:uno.css"
	import Navbar from "$lib/Navbar.svelte"

	let { children } = $props()
</script>

<svelte:body use:classList={`theme-${$preferences.theme} font-sans`} />

<Navbar></Navbar>

{@render children()}
