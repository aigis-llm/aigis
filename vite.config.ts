import { sveltekit } from "@sveltejs/kit/vite"
import UnoCSS from "unocss/vite"
import { svelteTesting } from "@testing-library/svelte/vite"
/// <reference types="vitest/config" />
import { defineConfig } from "vite"

export default defineConfig({
	plugins: [UnoCSS(), sveltekit(), svelteTesting()],
	test: {
		include: ["src/**/*.{test,spec}.{js,ts}"],
		setupFiles: ["./vitest-setup.ts"],
		environment: "happy-dom",
		watch: false,
	},
	server: {
		watch: {
			ignored: ["**/__pycache__/**", "**/.*_cache/**", "**/.venv/**", "**/.direnv/**"],
		},
	},
	envPrefix: "AIGIS_",
})
