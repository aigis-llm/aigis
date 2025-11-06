import { sveltekit } from "@sveltejs/kit/vite"
import { svelteTesting } from "@testing-library/svelte/vite"
/// <reference types="vitest/config" />
import { defineConfig } from "vite"
import catppuccin from "./catppuccin-plugin.vite"
import iconify from "./iconify-plugin.vite"

export default defineConfig(({ mode }) => ({
	plugins: [catppuccin(), iconify(), sveltekit(), svelteTesting()],
	resolve: {
		conditions: mode === "test" ? ["browser"] : [],
	},
	test: {
		include: ["src/**/*.{test,spec}.{js,ts}"],
		setupFiles: ["./vitest-setup.ts"],
		environment: "happy-dom",
		watch: false,
		reporters: ["default", "junit"],
		outputFile: "frontend.junit.xml",
		coverage: {
			provider: "istanbul", // v8 does not work in deno https://github.com/denoland/deno/issues/27003
			reporter: ["text", "lcov"],
			include: ["src/**"],
		},
	},
	server: {
		watch: {
			ignored: ["**/__pycache__/**", "**/.*_cache/**", "**/.venv/**", "**/.direnv/**"],
		},
	},
	envPrefix: "AIGIS_",
}))
