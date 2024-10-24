import { defineConfig, presetUno, presetIcons, presetWebFonts, presetTypography } from "unocss"
import { presetCatppuccin } from "@tuhana/unocss-catppuccin"

export default defineConfig({
	presets: [
		presetUno(),
		presetIcons(),
		//@ts-expect-error idk this does not like me
		presetCatppuccin(),
		presetWebFonts({
			provider: "fontsource",
			fonts: {
				sans: {
					name: "Inter",
				},
				mono: "Fira Code",
			},
		}),
		presetTypography(),
	],
})
