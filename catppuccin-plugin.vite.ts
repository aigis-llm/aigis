import type { Plugin } from "vite"
import { flavorEntries } from "@catppuccin/palette"
import * as cssTree from "css-tree"

export default function iconifyPlugin(): Plugin {
	const virtual_module_id = "virtual:catppuccin.css"
	const resolved_virtual_module_id = `\0${virtual_module_id}`

	return {
		name: "catppuccin",
		resolveId: (id) => {
			if (id === virtual_module_id) {
				return resolved_virtual_module_id
			}
		},
		load: async (id) => {
			if (id === resolved_virtual_module_id) {
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
			}
		},
	}
}
