<script lang="ts">
	import { createSelect, melt } from "@melt-ui/svelte"

	let {
		options = $bindable([]),
		selected = $bindable(),
		class: className = $bindable(""),
	}: { options: Array<string>; selected: string | undefined; class: string } = $props()

	/* eslint-disable @typescript-eslint/no-unused-vars */
	const {
		elements: { trigger, menu, option, group, groupLabel, label },
		states: { selectedLabel, open },
		helpers: { isSelected },
	} = createSelect<string>({
		forceVisible: true,
		positioning: {
			placement: "bottom",
			fitViewport: true,
			sameWidth: true,
		},
		defaultSelected: { value: selected || "", label: selected },
		onSelectedChange: (change) => {
			selected = change.next?.value
			return change.next
		},
	})
	/* eslint-enable @typescript-eslint/no-unused-vars */
</script>

<!-- svelte-ignore a11y_label_has_associated_control -->
<label use:melt={$label}></label>
<button class="rounded-md {className}" use:melt={$trigger}
	>{selected}
	<div class="i-tabler:chevron-down w-1em h-1em inline-block"></div></button
>
{#if $open}
	<div
		class="z-10 flex max-h-[300px] flex-col overflow-y-auto rounded-lg bg-[--ctp-surface0] p-1 focus:!ring-0"
		use:melt={$menu}
	>
		{#each options as item}
			<div
				class="rounded-md p-1 hover:bg-[--ctp-surface1] !aria-selected:bg-[--ctp-surface2]"
				use:melt={$option({ value: item, label: item })}
			>
				{item}
			</div>
		{/each}
	</div>
{/if}
