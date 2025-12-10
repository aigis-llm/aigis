import type { RequestHandler } from "@sveltejs/kit"
import { OpenAPIHandler } from "@orpc/openapi/fetch"
import { onError } from "@orpc/server"
import router from "$lib/api/router"

const handler = new OpenAPIHandler(router, {
	interceptors: [
		onError((error) => {
			console.error(error)
		}),
	],
})

const handle: RequestHandler = async ({ request, locals }) => {
	const { response } = await handler.handle(request, {
		prefix: "/api",
		context: {
			locals,
		},
	})

	return response ?? new Response("Not Found", { status: 404 })
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle
