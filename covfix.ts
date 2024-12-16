// Fix the lcov files and merge them
import { compile, parse, preprocess } from "svelte/compiler"
import { NullableMappedPosition, SourceMapConsumer } from "source-map"
import { LineCoverage, LineData, Report, SourceFile } from "@cedx/lcov"
import { preprocessMeltUI, sequence } from "@melt-ui/pp"
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte"
import { Node, walk } from "estree-walker"
import * as fsWalk from "@nodelib/fs.walk/promises"

const pycov = Report.parse(await Bun.file("coverage.lcov").text())
const jscov = Report.parse(await Bun.file("coverage/lcov.info").text())

for (const js_file of jscov.sourceFiles) {
	if (js_file.path.endsWith(".svelte")) {
		const svelte_code = await Bun.file(js_file.path).text()
		const preprocessed = await preprocess(
			svelte_code,
			sequence([vitePreprocess(), preprocessMeltUI()]),
			{
				filename: js_file.path,
			},
		)
		const compiled = compile(preprocessed.code, {
			filename: js_file.path,
			css: "injected",
			dev: true,
			generate: "client",
			runes: true,
			sourcemap: preprocessed.map,
		})
		const parsed = parse(preprocessed.code, {
			filename: js_file.path,
			modern: true,
		})
		const new_file = await SourceMapConsumer.with(compiled.js.map, null, (consumer) => {
			const new_line_data: Array<LineData> = []
			for (const line of js_file.lines?.data || []) {
				let orig_pos: NullableMappedPosition | null = null
				let test_column = 0
				let skip = false
				while (true) {
					test_column += 1
					if (test_column >= 1000) {
						skip = true
						break
					}
					const test_pos = consumer.originalPositionFor({
						line: line.lineNumber,
						column: test_column,
					})
					if (test_pos.line && test_pos.line != 0) {
						orig_pos = test_pos
						break
					}
				}
				if (skip) {
					continue
				}
				new_line_data.push(
					new LineData({
						...line,
						lineNumber: orig_pos?.line || 0,
					}),
				)
			}
			const line_numbers = new_line_data.map((lineData) => lineData.lineNumber)
			const unused_line_numbers = Array.from(
				{ length: svelte_code.split("\n").length },
				(_, i) => i + 1,
			).filter((line) => {
				return line_numbers.indexOf(line) == -1
			})
			walk(parsed.instance?.content as Node, {
				enter: (node) => {
					if (node.type == "BlockStatement") {
						const block_lines = Array.from(
							{ length: (node.loc?.end.line || 0) - (node.loc?.start.line || 0) + 1 },
							(_, i) => i + (node.loc?.start.line || 0),
						)
						const is_block_no_exec = new_line_data
							.filter((line_data) => {
								return block_lines.includes(line_data.lineNumber)
							})
							.every((line_data) => {
								return line_data.executionCount == 0
							})
						if (is_block_no_exec) {
							new_line_data.push(
								...block_lines.map((line) => {
									unused_line_numbers.splice(unused_line_numbers.indexOf(line), 1)
									return new LineData({
										checksum: "",
										executionCount: 0,
										lineNumber: line,
									})
								}),
							)
						} else {
							new_line_data.push(
								...block_lines.map((line) => {
									return new LineData({
										checksum: "",
										executionCount: 1,
										lineNumber: line,
									})
								}),
							)
						}
					}
				},
			})
			new_line_data.push(
				...unused_line_numbers.map((line) => {
					return new LineData({
						checksum: "",
						executionCount: 1,
						lineNumber: line,
					})
				}),
			)
			const used_lines: Map<number, boolean> = new Map()
			for (const line of new_line_data) {
				if (!used_lines.get(line.lineNumber)) {
					used_lines.set(line.lineNumber, new Boolean(line.executionCount).valueOf())
				}
			}
			if (svelte_code.split("\n").at(-1) == "") {
				used_lines.set(svelte_code.split("\n").length, true)
			}
			const dedup_line_data: Array<LineData> = []
			for (const line of new_line_data) {
				const line_index = dedup_line_data.findIndex((dd_line) => {
					return dd_line.lineNumber == line.lineNumber
				})
				if (line_index == -1) {
					dedup_line_data.push(line)
				} else {
					dedup_line_data[line_index] = new LineData({
						...dedup_line_data[line_index],
						executionCount: dedup_line_data[line_index].executionCount + line.executionCount,
					})
				}
			}
			const return_file = new SourceFile(js_file.path, {
				...js_file,
				lines: new LineCoverage({
					data: dedup_line_data,
					found: svelte_code.split("\n").length,
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					hit: [...used_lines].filter(([line, executed]) => {
						return executed
					}).length,
				}),
			})
			return return_file
		})
		jscov.sourceFiles[
			jscov.sourceFiles.findIndex((file) => {
				return file.path == js_file.path
			})
		] = new_file
	}
}

const outcov = new Report("")

outcov.sourceFiles.push(...jscov.sourceFiles, ...pycov.sourceFiles)

const entries = await fsWalk.walk("src", {
	entryFilter: (entry) => {
		return (
			!entry.dirent.isDirectory() &&
			!outcov.sourceFiles.some((e) => {
				return e.path == entry.path
			}) &&
			!entry.path.includes("pycache") &&
			!entry.path.endsWith(".d.ts") &&
			!entry.path.endsWith(".test.ts") &&
			!entry.path.endsWith(".css") &&
			!entry.path.endsWith(".html")
		)
	},
})

for (const entry of entries) {
	const file_lines = (await Bun.file(entry.path).text()).split("\n")
	outcov.sourceFiles.push(
		new SourceFile(entry.path, {
			lines: new LineCoverage({
				data: file_lines.map((_, index) => {
					return new LineData({
						checksum: "",
						executionCount: 0,
						lineNumber: index + 1,
					})
				}),
				found: file_lines.length,
				hit: 0,
			}),
		}),
	)
}

Bun.write("./merged-coverage.lcov", outcov.toString())
