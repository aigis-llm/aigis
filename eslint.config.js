import antfu from "@antfu/eslint-config"
import { mergeProcessors } from "eslint-merge-processors"
import eslint_plugin_svelte from "eslint-plugin-svelte"
import svelte_css_processor from "./svelte-css-processor.eslint.ts"

export default antfu({
	stylistic: {
		indent: "tab",
		quotes: "double",
		overrides: {
			"style/brace-style": ["error", "1tbs", { allowSingleLine: true }],
		},
	},

	test: {
		overrides: {
			"test/consistent-test-it": ["error", { fn: "test", withinDescribe: "test" }],
			"test/prefer-lowercase-title": ["error", { ignore: ["describe", "test"] }],
		},
	},

	imports: {
		overrides: {
			"perfectionist/sort-imports": [
				"error",
				{
					newlinesBetween: "ignore",
					groups: [
						"type",
						["parent-type", "sibling-type", "index-type", "internal-type"],

						"builtin",
						"svelte",
						"external",
						"sveltekit",
						"internal",
						["parent", "sibling", "index"],
						"side-effect",
						"object",
						"unknown",
					],
					customGroups: [
						{
							groupName: "svelte",
							elementNamePattern: "^svelte.*",
						},
						{
							groupName: "sveltekit",
							elementNamePattern: ["\\$app/.+", "\\$env/.+", "\\$lib/.+", "\\$lib"],
						},
					],
				},
			],
		},
	},

	typescript: true,
	svelte: true,
	formatters: {
		css: true,
	},
	toml: {
		overrides: {
			"toml/indent": ["error", "tab"],
		},
	},
}, {
	files: ["**/*.svelte"],
	processor: mergeProcessors([
		eslint_plugin_svelte.processors[".svelte"],
		svelte_css_processor(),
	]),
}, {
	files: ["src/lib/drizzle/{relations,schema}.ts"],
	rules: {
		"unused-imports/no-unused-vars": ["off"],
		"ts/no-use-before-define": ["off"],
	},
})
