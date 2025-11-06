import type { Plugin } from "vite"
import tabler_icons_json from "@iconify-json/tabler/icons.json" with { type: "json" }
import { getIconsCSS } from "@iconify/utils"

const tabler_icons = ["chevron-down", "menu-2", "x"]

export default function iconifyPlugin(): Plugin {
	const virtual_module_id = "virtual:iconify.css"
	const resolved_virtual_module_id = `\0${virtual_module_id}`

	return {
		name: "iconify",
		resolveId: (id) => {
			if (id === virtual_module_id) {
				return resolved_virtual_module_id
			}
		},
		load: async (id) => {
			if (id === resolved_virtual_module_id) {
				let code = ""
				code += getIconsCSS(tabler_icons_json, tabler_icons, {
					iconSelector: ".i-tabler\\:{name}",
					commonSelector: "",
				})
				return code
			}
		},
	}
}
