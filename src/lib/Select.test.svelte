<script lang="ts">
	import Select from "$lib/Select.svelte"

	let selected = $state({
		value: "alice",
		label: "Alice",
	})

	const options = [
		{ value: "alice", label: "Alice" },
		{ value: "bob", label: "Bob" },
	]
</script>

<Select {options} bind:selected>Name:</Select>
