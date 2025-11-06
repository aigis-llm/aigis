import type { Component, SvelteComponent } from "svelte"
import { render as _render } from "@testing-library/svelte"
import resetCss from "$lib/reset.css" with { type: "text" }
import iconifyPlugin from "../../iconify-plugin.vite"

export async function render<

	C extends Component<any, any, string> | SvelteComponent<any, any, any>,
>(
	component: Parameters<typeof _render<C>>[0],
	renderOptions: Parameters<typeof _render<C>>[1] = {},
) {
	const result = _render(component, renderOptions)
	const head = document.querySelector("head") as HTMLHeadElement

	const reset_style = document.createElement("style")
	reset_style.textContent = resetCss as string
	head.appendChild(reset_style)

	const iconify_style = document.createElement("style")
	iconify_style.textContent = await (iconifyPlugin().load as (_: string) => Promise<string>)("\0virtual:iconify.css")
	head.appendChild(iconify_style)

	return result
}

export function pixel7() {
	// @ts-expect-error happyDOM is only in tests
	window.happyDOM.setInnerWidth(412)
	// @ts-expect-error same as above
	window.happyDOM.setInnerHeight(915)
}
