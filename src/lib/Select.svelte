<script lang="ts">
	import { createSelect, melt } from '@melt-ui/svelte'

	let { options, selected = $bindable()}: { options: Array<string>, selected: string | undefined } = $props()

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
		defaultSelected: {value: selected || "", label: selected},
		onSelectedChange: (change) => { selected = change.next?.value; return change.next},
	})
</script>

<!-- svelte-ignore a11y_label_has_associated_control - $label contains the 'for' attribute -->
<label use:melt={$label}></label>
<button class="rounded-md" use:melt={$trigger}>{selected} <div class="i-tabler:chevron-down w-1em h-1em inline-block"></div></button>
{#if $open}
<div class="z-10 flex max-h-[300px] flex-col overflow-y-auto rounded-lg bg-white p-1 shadow focus:!ring-0" use:melt={$menu}>
	{#each options as item}
		<div use:melt={$option({ value: item, label: item })}>{item}</div>
	{/each}
</div>
{/if}