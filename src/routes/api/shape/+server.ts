import type { RequestHandler } from "@sveltejs/kit"
import process from "node:process"
import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from "@electric-sql/client"
import { error } from "@sveltejs/kit"
import { match, P } from "ts-pattern"

export const GET: RequestHandler = async ({ url }) => {
	const originUrl = new URL(process.env.AIGIS_ELECTRIC_URL!)
	url.searchParams.forEach((value, key) => {
		if (ELECTRIC_PROTOCOL_QUERY_PARAMS.includes(key)) {
			originUrl.searchParams.set(key, value)
		}
	})

	match(url.searchParams.get("table"))
		.with("user", () => {
			// everyone can see all users, but only certian columns
			originUrl.searchParams.set("columns", `id,name,email,image,"createdAt"`)
		})
		.with(P.nonNullable, () => {
			error(404, {
				message: `Table ${url.searchParams.get("table")} does not exist or is not exposed`,
			})
		})
		.with(P.nullish, () => {
			error(400, {
				message: `Please provide a table`,
			})
		})
		.exhaustive()

	// A nullish value will have errored by now
	originUrl.searchParams.set("table", url.searchParams.get("table")!)

	const response = await fetch(originUrl)

	// Fetch decompresses the body but doesn't remove the
	// content-encoding & content-length headers which would
	// break decoding in the browser.
	//
	// See https://github.com/whatwg/fetch/issues/1729
	const headers = new Headers(response.headers)
	headers.delete(`content-encoding`)
	headers.delete(`content-length`)

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	})
}
