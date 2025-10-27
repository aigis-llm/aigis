// some parts copy+pasted from https://github.com/antfu/eslint-processor-vue-blocks/blob/520233a/src/index.ts
import type { Linter } from "eslint"
import { parse } from "svelte/compiler"

// Original from https://github.com/cspotcode/outdent/blob/957909e/src/index.ts#L53-L101
const reLeadingNewline = /^[ \t]*(?:\r\n|\r|\n)/
const reTrailingNewline = /(?:\r\n|\r|\n)[ \t]*$/
const reDetectIndentation = /(?:\r\n|\r|\n)([ \t]*)(?:[^ \t\r\n]|$)/

function _outdent_array(
	strings: ReadonlyArray<string>,
	options: {
		newline?: boolean
		trimLeadingNewline?: boolean
		trimTrailingNewline?: boolean
	},
): { outdentedStrings: Array<string>, indentationLevel: number } {
	// If first interpolated value is a reference to outdent,
	// determine indentation level from the indentation of the interpolated value.
	let indentationLevel = 0

	const match = strings[0].match(reDetectIndentation)
	if (match) {
		indentationLevel = match[1].length
	}

	const reSource = `(\\r\\n|\\r|\\n).{0,${indentationLevel}}`
	const reMatchIndent = new RegExp(reSource, "g")

	const { newline, trimLeadingNewline, trimTrailingNewline } = options
	const normalizeNewlines = typeof newline === "string"
	const l = strings.length
	const outdentedStrings = strings.map((v, i) => {
		// Remove leading indentation from all lines
		v = v.replace(reMatchIndent, "$1")
		// Trim a leading newline from the first string
		if (i === 0 && trimLeadingNewline) {
			v = v.replace(reLeadingNewline, "")
		}
		// Trim a trailing newline from the last string
		if (i === l - 1 && trimTrailingNewline) {
			v = v.replace(reTrailingNewline, "")
		}
		// Normalize newlines
		if (normalizeNewlines) {
			v = v.replace(/\r\n|\n|\r/g, _ => newline as string)
		}
		return v
	})
	return {
		outdentedStrings,
		indentationLevel,
	}
}

interface Block extends Linter.ProcessorFile {
	wrapper: TextWrapper
	startOffset: number
	indentationLevel: number
	ogtext: string
}

class TextWrapper {
	lines: string[]
	linesLength: number[]

	constructor(
		public text: string,
	) {
		this.lines = text.split("\n")
		this.lines.forEach((_, index) => {
			if (index !== this.lines.length - 1) {
				this.lines[index] += "\n"
			}
		})
		this.linesLength = this.lines.map(line => line.length)
	}

	getLineColumn(index: number) {
		let line = 0
		while (index >= this.linesLength[line]) {
			index -= this.linesLength[line]
			line++
		}
		return {
			line: line + 1,
			column: index,
		}
	}

	getIndex(line: number, column: number) {
		return this.linesLength.slice(0, line - 1).reduce((a, b) => a + b, 0) + column
	}
}

const cache = new Map<string, Block>()

export default function svelte_css_processor(): Linter.Processor {
	return {
		meta: {
			name: "svelte_css_processor",
		},
		supportsAutofix: true,
		preprocess: (text, filename) => {
			const parsed = parse(text, { modern: true }).css
			const outdented = _outdent_array([parsed?.content.styles || ""], { trimLeadingNewline: true, trimTrailingNewline: false })
			const startOffset = parsed?.content.start ? (parsed.content.start + 1) : 0
			const block = {
				text: outdented.outdentedStrings[0],
				ogtext: text,
				filename: `${filename}.css`,
				wrapper: new TextWrapper(text),
				startOffset,
				indentationLevel: outdented.indentationLevel,
			}
			cache.set(filename, block)
			return [block]
		},
		postprocess: (messages, filename) => {
			const block = cache.get(filename)!
			cache.delete(filename)

			return ((new Array<Linter.LintMessage>()).concat(...messages).map((message) => {
				const startOffset = block.startOffset
				const localLineColumn = new TextWrapper(block.text)
				// TODO: make this a little more accurate?
				const start = block.wrapper.getLineColumn(
					startOffset + localLineColumn.getIndex(message.line, message.column + 1) + (block.indentationLevel * message.line),
				)
				const end = block.wrapper.getLineColumn(
					startOffset + localLineColumn.getIndex(message.endLine!, message.endColumn!) + (block.indentationLevel * message.endLine!),
				)

				return {
					...message,
					line: start.line,
					column: start.column,
					endLine: end.line,
					endColumn: end.column,
					fix: message.fix && {
						...message.fix,
						range: message.fix.range.map(i => i + startOffset + (block.indentationLevel * message.line)),
					} as typeof message.fix,
				}
			}))
		},
	}
}
