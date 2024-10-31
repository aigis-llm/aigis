import { defineConfig, presetUno, presetIcons, presetWebFonts, presetTypography } from "unocss"
import extractorSvelte from "@unocss/extractor-svelte"
import { presetCatppuccin } from "@tuhana/unocss-catppuccin"

export default defineConfig({
	extractors: [extractorSvelte()],
	presets: [
		presetUno(),
		presetIcons(),
		//@ts-expect-error idk this does not like me
		presetCatppuccin(),
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
		"font-sans"
	]
})
