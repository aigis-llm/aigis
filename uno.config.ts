import {
	defineConfig,
	presetUno,
	presetIcons,
	presetWebFonts,
	presetTypography,
	transformerDirectives,
} from "unocss"
import extractorSvelte from "@unocss/extractor-svelte"
import * as cssTree from "css-tree"
import { flavorEntries } from "@catppuccin/palette"

export default defineConfig({
	extractors: [extractorSvelte()],
	transformers: [transformerDirectives()],
	preflights: [
		{
			getCSS: () => {
				const ast = cssTree.parse("") as cssTree.StyleSheet
				for (const flavor of flavorEntries) {
					const flavorRule: cssTree.Rule = {
						type: "Rule",
						prelude: {
							type: "SelectorList",
							children: new cssTree.List<cssTree.CssNode>().appendData({
								type: "Selector",
								children: new cssTree.List<cssTree.CssNode>().appendData({
									type: "ClassSelector",
									name: `theme-${flavor[0]}`,
								}),
							}),
						},
						block: {
							type: "Block",
							children: new cssTree.List(),
						},
					}
					for (const color of flavor[1].colorEntries) {
						flavorRule.block.children.push({
							type: "Declaration",
							property: `--ctp-${color[0]}`,
							value: { type: "Raw", value: `hsl(var(--ctp-${flavor[0]}-${color[0]}-hsl))` },
							important: false,
						})
					}
					ast.children.push(flavorRule)
				}
				return cssTree.generate(ast as cssTree.CssNode)
			},
		},
	],
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
	safelist: ["font-sans", "!hidden"],
})
