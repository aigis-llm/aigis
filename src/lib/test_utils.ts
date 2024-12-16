import { render as _render } from "@testing-library/svelte"
import initUnocssRuntime from "@unocss/runtime"
import resetCss from "$lib/reset.css" with { type: "text" }
import unocss_config from "../../uno.config"
import { sleep } from "bun"
import type { Component } from "svelte"

export function pixel7() {
	window.innerWidth = 412
	window.innerHeight = 915
}

export async function render(component: Component) {
	_render(component)
	const head = document.querySelector("head") as HTMLHeadElement
	const html = document.querySelector("html") as HTMLHtmlElement
	html.setAttribute("un-cloak", "a")

	const style = document.createElement("style")
	style.innerText = resetCss as string
	head.appendChild(style)

	initUnocssRuntime({ defaults: unocss_config })

	await sleep(10) // somehow this magically makes it work

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
}
