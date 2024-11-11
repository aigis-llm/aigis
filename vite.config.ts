import { sveltekit } from "@sveltejs/kit/vite"
import UnoCSS from "unocss/vite"
import { defineConfig } from "vite"

export default defineConfig({
	plugins: [UnoCSS(), sveltekit()],
	//test: {
	//	include: ["src/**/*.{test,spec}.{js,ts}"],
	//},
	server: {
		watch: {
			ignored: ["**/__pycache__/**", "**/.*_cache/**", "**/.venv/**", "**/.direnv/**"],
		},
	},
	envPrefix: "AIGIS_",
})
