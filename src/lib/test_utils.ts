import { render as _render } from "@testing-library/svelte"
import initUnocssRuntime from "@unocss/runtime"
import resetCss from "$lib/reset.css" with { type: "text" }
import unocss_config from "../../uno.config"
import type { Component, SvelteComponent } from "svelte"

export async function render<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	C extends Component<any, any, string> | SvelteComponent<any, any, any>,
>(
	component: Parameters<typeof _render<C>>[0],
	renderOptions: Parameters<typeof _render<C>>[1] = {},
) {
	const result = _render(component, renderOptions)
	const head = document.querySelector("head") as HTMLHeadElement
	const html = document.querySelector("html") as HTMLHtmlElement
	html.setAttribute("un-cloak", "a")

	const style = document.createElement("style")
	style.innerText = resetCss as string
	head.appendChild(style)

	initUnocssRuntime({ defaults: unocss_config })

	await new Promise((_) => setTimeout(_, 10))

	await new Promise((resolve) => {
		if (html.getAttribute("un-cloak") == null) {
			resolve(null)
		}
		new MutationObserver((_, observer) => {
			if (html.getAttribute("un-cloak") == null) {
				resolve(null)
				observer.disconnect()
			}
		}).observe(html, {
			attributes: true,
			childList: true,
			subtree: true,
		})
		setTimeout(() => {
			resolve(null)
		}, 500) // Should fix tests timing out
	})

	return result
}

export function pixel7() {
	//@ts-expect-error happyDOM is only in tests
	window.happyDOM.setInnerWidth(412)
	//@ts-expect-error same as above
	window.happyDOM.setInnerHeight(915)
}
