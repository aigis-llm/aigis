<script>
	import "$lib/reset.css"
	import "virtual:uno.css"

	let { children } = $props()
</script>

<div id="root" style="display: contents" class="font-sans">{@render children()}</div>
