<script lang="ts">
	import { classList } from "svelte-body"
	import { preferences } from "$lib/stores"
	import "$lib/reset.css"
	import "virtual:uno.css"
	import { invalidate } from "$app/navigation"
	import { onMount } from "svelte"
	import Navbar from "$lib/Navbar.svelte"

	let { children, data } = $props()

	const { session, supabase } = $derived(data)

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate("supabase:auth")
			}
		})

		return () => data.subscription.unsubscribe()
	})
</script>

<svelte:body use:classList={`theme-${$preferences.theme} font-sans`} />

<Navbar></Navbar>

{@render children()}
