import { Octokit } from "octokit"
import github from "@actions/github"
import { Report } from "@cedx/lcov"
import { $ } from "bun"
import { GetResponseDataTypeFromEndpointMethod } from "@octokit/types"

const coverage_comment_header = "### Coverage Report for commit"

const report = Report.parse(await Bun.file("merged-coverage.lcov").text())
const output: Array<string> = []
let octokit: Octokit | undefined

const changed_files = await (async () => {
	if (process.env.CI) {
		octokit = new Octokit({
			auth: process.env.GITHUB_TOKEN,
		})
		const files_pages = await octokit.paginate.iterator(
			octokit.rest.pulls.listFiles.endpoint.merge({
				owner: github.context.repo.owner,
				repo: github.context.repo.repo,
				pull_number: github.context.payload.pull_request?.number,
			}),
		)
		const file_names: Array<string> = []
		for await (const response of files_pages) {
			for (const file of response.data as GetResponseDataTypeFromEndpointMethod<
				typeof octokit.rest.pulls.listFiles
			>) {
				file_names.push(file.filename)
			}
		}
		return file_names
	} else {
		const changed_file_buffer = new ArrayBuffer(16384)
		await $`git diff --name-only ${process.env.BASE_COMMIT || "HEAD~"} HEAD > ${changed_file_buffer}`
		return new TextDecoder().decode(changed_file_buffer).split("\n")
	}
})()

const total_lines = report.sourceFiles
	.map((report_file) => report_file.lines?.found)
	.reduce((prev_found, new_found) => (prev_found || 0) + (new_found || 0))
const executed_lines = report.sourceFiles
	.map((report_file) => report_file.lines?.hit)
	.reduce((prev_hit, new_hit) => (prev_hit || 0) + (new_hit || 0))

output.push(
	`Total: ${((100 * (executed_lines || 0)) / (total_lines || 0)).toFixed(2)}% covered, ${executed_lines}/${total_lines} lines.`,
)
output.push("")
for (const report_file of report.sourceFiles) {
	if (changed_files.includes(report_file.path)) {
		const unexecuted_ranges: Array<[number, number]> = []
		for (const line of report_file.lines?.data.filter((line) => {
			return line.executionCount == 0
		}) || []) {
			const range_index = unexecuted_ranges.findIndex((range) => {
				return range[1] + 1 == line.lineNumber
			})
			if (range_index == -1) {
				unexecuted_ranges.push([line.lineNumber, line.lineNumber])
			} else {
				unexecuted_ranges[range_index] = [unexecuted_ranges[range_index][0], line.lineNumber]
			}
		}
		const uncovered_lines = unexecuted_ranges.map(([start, end]) => `${start}-${end}`).join(" ")
		output.push(
			`${report_file.path}: ${((100 * (report_file.lines?.hit || 0)) / (report_file.lines?.found || 0)).toFixed(2)}%, ${report_file.lines?.hit}/${report_file.lines?.found}${uncovered_lines == "" ? "" : `, ${uncovered_lines}`}`,
		)
	}
}

console.log(output.join("\n"))

if (process.env.CI) {
	octokit = octokit as Octokit // Will already be initialized
	const pr_info = await octokit.rest.pulls.get({
		repo: github.context.repo.repo,
		owner: github.context.repo.owner,
		pull_number: github.context.payload.pull_request?.number || 0,
	})
	const issue_comments_pages = await octokit.paginate.iterator(
		octokit.rest.issues.listComments.endpoint.merge({
			repo: github.context.repo.repo,
			owner: github.context.repo.owner,
			issue_number: github.context.payload.pull_request?.number,
		}),
	)
	const new_body = `
		${coverage_comment_header} [${pr_info.data.head.sha}](https://github.com/${github.context.repo.owner}/${github.context.repo.repo}/commit/${pr_info.data.head.sha})
		<pre>
		${output.join("\n")}
		</pre>
	`
	let updated = false
	for await (const response of issue_comments_pages) {
		for (const comment of response.data as GetResponseDataTypeFromEndpointMethod<
			typeof octokit.rest.issues.listComments
		>) {
			if (comment.body?.includes(coverage_comment_header)) {
				await octokit.rest.issues.updateComment({
					repo: github.context.repo.repo,
					owner: github.context.repo.owner,
					comment_id: comment.id,
					body: new_body,
				})
				updated = true
				break
			}
		}
		if (updated) {
			break
		}
	}
	if (!updated) {
		await octokit.rest.issues.createComment({
			repo: github.context.repo.repo,
			owner: github.context.repo.owner,
			issue_number: github.context.payload.pull_request?.number || 0,
			body: new_body,
		})
	}
}
