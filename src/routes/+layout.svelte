<script lang="ts">
	import { classList } from "svelte-body"
	import { QueryClientProvider } from "@tanstack/svelte-query"
	import Navbar from "$lib/Navbar.svelte"
	import "$lib/reset.css"
	import { preferences } from "$lib/stores"
	import "virtual:catppuccin.css"
	import "virtual:iconify.css"

	const { data, children } = $props()
</script>

<svelte:body use:classList={`theme-${$preferences.theme} font-sans`} />

<QueryClientProvider client={data.queryClient}>
	<Navbar></Navbar>

	{@render children()}
</QueryClientProvider>
