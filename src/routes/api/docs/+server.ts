import type { RequestHandler } from "./$types"
import { ScalarApiReference } from "@scalar/sveltekit"
import catppuccinCss from "virtual:catppuccin.css"
import css from "./scalar.css?inline"

const render = ScalarApiReference({
	url: `${import.meta.env.AIGIS_FRONTEND_URL}/api/spec.json`,
	withDefaultFonts: false,
	theme: "none",
	customCss: `${catppuccinCss}\n${css}`,
	plugins: [
		() => {
			return {
				name: "catppuccin",
				extensions: [],
				views: {
					"content.end": [
						{
							component: null,
							renderer: () => {
								const theme = JSON.parse(localStorage.getItem("preferences")!).theme || "mocha"
								document.body.classList.add(`theme-${theme}`)
							},
						},
					],
				},
			}
		},
	],
})

export const GET: RequestHandler = () => {
	return render()
}
