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
	class="flex flex-row items-center rounded-md cursor-pointer border-2 border-solid border-[--ctp-surface1] color-[--ctp-text] bg-[--ctp-surface0] {className}"
	use:melt={$trigger}
>
	<div class="flex-1 text-start {button_label_class}">{$selectedLabel}</div>
	<div
		class="i-tabler:chevron-down flex-initial w-1em h-1em inline-block {button_icon_class}"
	></div>
</button>
{#if $open}
	<div
		class="z-10 flex max-h-[300px] flex-col overflow-y-auto rounded-lg bg-[--ctp-surface0] p-1 {select_div_class}"
		use:melt={$menu}
	>
		{#each options as item}
			<div
				class="rounded-lg p-1 data-[highlighted]:bg-[--ctp-surface1] !aria-selected:bg-[--ctp-surface2] cursor-pointer {select_option_class}"
				use:melt={$option(item)}
			>
				{item.label}
			</div>
		{/each}
	</div>
{/if}
