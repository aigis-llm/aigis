import type { RequestHandler } from "@sveltejs/kit"
import { redirect } from "@sveltejs/kit"
import { auth } from "$lib/auth"

export const GET: RequestHandler = async ({ request }) => {
	await auth.api.signOut({
		headers: request.headers,
	})
	redirect(303, "/")
}
