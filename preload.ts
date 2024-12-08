import { GlobalRegistrator } from "@happy-dom/global-registrator"
import { expect, mock } from "bun:test"
import { plugin } from "bun"
import * as matchers from "@testing-library/jest-dom/matchers"
import { type AfterNavigate } from "@sveltejs/kit"
import esbuildSvelte from "esbuild-svelte"

GlobalRegistrator.register()

expect.extend(matchers)

await plugin(
	//@ts-expect-error Bun is not esbuild.
	esbuildSvelte({
		compilerOptions: { css: "injected", dev: true, generate: "client", runes: true },
		filterWarnings: (warning) => {
			// we don't want warnings from node modules that we can do nothing about
			return !warning.filename?.includes("node_modules")
		},
	}),
)

mock.module("$app/environment", () => {
	return {
		dev: false,
		browser: true,
	}
})

mock.module("$app/navigation", () => {
	const afterNavigateCallbacks: Array<(navigation: AfterNavigate) => void> = []
	function afterNavigate(callback: (navigation: AfterNavigate) => void): void {
		afterNavigateCallbacks.push(callback)
	}
	return {
		afterNavigate,
	}
})
