<script lang="ts">
	import type { Snippet } from "svelte"

	import { createSelect, melt } from "@melt-ui/svelte"

	let {
		children,
		options = $bindable([]),
		selected = $bindable({ value: "ERROR", label: "ERROR" }),
		class: className = $bindable(""),
		label_class = $bindable(""),
		button_label_class = $bindable(""),
		button_icon_class = $bindable(""),
		select_div_class = $bindable(""),
		select_option_class = $bindable(""),
	}: {
		children: Snippet
		options: Array<{ value: string, label: string }>
		selected: { value: string, label: string }
		class?: string
		label_class?: string
		button_label_class?: string
		button_icon_class?: string
		select_div_class?: string
		select_option_class?: string
	} = $props()

	const {
		elements: { trigger, menu, option, label },
		states: { selectedLabel, open },
	} = createSelect<string>({
		forceVisible: true,
		positioning: {
			placement: "bottom",
			fitViewport: true,
			sameWidth: true,
		},
		defaultSelected: { value: selected?.value || "", label: selected?.label },
		onSelectedChange: (change) => {
			selected.value = change.next?.value || ""
			return change.next
		},
	})
</script>

<label class={label_class} use:melt={$label}>{@render children()}</label>
<button
	class={className}
	use:melt={$trigger}
>
	<div class="button-label {button_label_class}">{$selectedLabel}</div>
	<div
		class="i-tabler:chevron-down button-icon {button_icon_class}"
	></div>
</button>
{#if $open}
	<div
		class="select {select_div_class}"
		use:melt={$menu}
	>
		{#each options as item}
			<div
				class="select-option {select_option_class}"
				use:melt={$option(item)}
			>
				{item.label}
			</div>
		{/each}
	</div>
{/if}

<style>
	button {
		display: flex;
		flex-direction: row;
		cursor: pointer;
		align-items: center;
		border-width: 2px;
		border-color: var(--ctp-surface1);
		border-radius: 0.375rem;
		border-style: solid;
		background-color: var(--ctp-surface0);
		color: var(--ctp-text);
		width: var(--width, auto);
		.button-label {
			flex: 1 1 0%;
			text-align: start;
		}
		.button-icon {
			display: inline-block;
			height: 1em;
			width: 1em;
			flex: 0 1 auto;
		}
	}
	.select {
		z-index: 10;
		max-height: 300px;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		border-radius: 0.5rem;
		background-color: var(--ctp-surface0);
		padding: 0.25rem;
		.select-option {
			cursor: pointer;
			border-radius: 0.5rem;
			padding: 0.25rem;
			&[data-highlighted] {
				background-color: var(--ctp-surface1);
			}
			&[aria-selected="true"] {
				background-color: var(--ctp-surface2);
			}
		}
	}
</style>
