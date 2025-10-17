import type { RequestEvent } from "@sveltejs/kit"
import type { FormData as HappyFormData } from "happy-dom"
import type { Component, SvelteComponent } from "svelte"
import { render as _render } from "@testing-library/svelte"
import * as cookie from "cookie"
import { afterAll, beforeAll, vi } from "vitest"
import type { RouteId, RouteParams } from "$app/types"
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

let currentRequestEvent: RequestEvent & { changedCookies: Record<string, string | undefined> } | null = null

export function requestEvent<T extends RouteId>(
	request: Request,
	{ locals, params }: { locals?: App.Locals, params?: RouteParams<T> } = {},
): RequestEvent<RouteParams<T>, T> {
	const url = new URL(request.url)
	const changedCookies: Record<string, string | undefined> = {}
	// @ts-expect-error `cookies` and `fetch` need to be created after the `event` itself
	currentRequestEvent = <RequestEvent<RouteParams<T>, T>>{
		cookies: null,
		fetch: null,
		locals: locals!,
		params: params!,
		request,
		url,
		getClientAddress: () => "127.0.0.1",
		setHeaders: () => null,
		platform: "",
		route: "",
		isDataRequest: false,
		isRemoteRequest: false,
		isSubRequest: false,
		tracing: {
			enabled: false,
		},
		changedCookies,
	}
	currentRequestEvent!.cookies = {
		get: (name, opts) => {
			return cookie.parse(request.headers.get("Cookie") || "", opts)[name]
		},
		getAll: (opts) => {
			const parsed = cookie.parse(request.headers.get("Cookie") || "", opts)
			return Object.keys(parsed).map((key) => {
				return {
					name: key,
					value: parsed[key]!,
				}
			})
		},
		delete: (name) => {
			changedCookies[name] = undefined
		},
		set: (name, value) => {
			changedCookies[name] = value
		},
		serialize: (name, value, opts) => {
			console.warn("SERIALIZE", name, value, opts)
			return "IDK what this returns"
		},
	}
	return currentRequestEvent as unknown as RequestEvent<RouteParams<T>, T>
}

export function mockGetRequestEvent() {
	beforeAll(() => {
		vi.mock("$app/server", async (importOriginal) => {
			const actual = await importOriginal() as object
			return {
				...actual,
				getRequestEvent: () => currentRequestEvent,
			}
		})
	})

	afterAll(() => {
		vi.resetAllMocks()
	})
}

export function happyDOMFormDataToNativeDenoFormData(formData: HappyFormData) {
	const newFormData = new FormData()
	for (const [key, value] of formData.entries()) {
		newFormData.set(key, value as string)
	}
	return newFormData
}
