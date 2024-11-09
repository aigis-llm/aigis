import {
	defineConfig,
	presetUno,
	presetIcons,
	presetWebFonts,
	presetTypography,
	transformerDirectives,
} from "unocss"
import extractorSvelte from "@unocss/extractor-svelte"

export default defineConfig({
	extractors: [extractorSvelte()],
	transformers: [transformerDirectives()],
	presets: [
		presetUno(),
		presetIcons(),
		presetWebFonts({
			provider: "none",
			fonts: {
				sans: "Inter",
				mono: "Fira Code",
			},
		}),
		presetTypography(),
	],
	safelist: [
		"font-sans",
	],
})
