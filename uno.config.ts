import { defineConfig, presetUno, presetIcons, presetWebFonts, presetTypography, transformerDirectives } from "unocss"
import extractorSvelte from "@unocss/extractor-svelte"
import { presetCatppuccin } from "@tuhana/unocss-catppuccin"
import { flavorEntries } from "@catppuccin/palette"

export default defineConfig({
	extractors: [extractorSvelte()],
	transformers: [
		transformerDirectives()
	],
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
		"font-sans",
		...(() => {
			const output: Array<string> = []
			for (const flavor of flavorEntries) {
				for (const color of flavor[1].colorEntries) {
					output.push(`color-ctp-${flavor[0]}-${color[0]}`)
					output.push(`bg-ctp-${flavor[0]}-${color[0]}`)
				}
			}
			return output
		})()
	]
})
