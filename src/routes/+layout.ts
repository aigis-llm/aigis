import create_backend_fetch from "$lib/backend_fetch.js"
import type { Database } from "$lib/database.types.ts"
import type { LayoutLoad } from "./$types"
import { createBrowserClient, createServerClient, isBrowser } from "@supabase/ssr"

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
	depends("supabase:auth")

	const supabase = isBrowser()
		? createBrowserClient<Database>(
				import.meta.env.AIGIS_SUPABASE_URL,
				import.meta.env.AIGIS_SUPABASE_KEY,
				{
					global: {
						fetch,
					},
				},
			)
		: createServerClient<Database>(
				import.meta.env.AIGIS_SUPABASE_URL,
				import.meta.env.AIGIS_SUPABASE_KEY,
				{
					global: {
						fetch,
					},
					cookies: {
						getAll() {
							return data?.cookies || []
						},
					},
				},
			)

	/**
	 * It's fine to use `getSession` here, because on the client, `getSession` is
	 * safe, and on the server, it reads `session` from the `LayoutData`, which
	 * safely checked the session using `safeGetSession`.
	 */
	const {
		data: { session },
	} = await supabase.auth.getSession()

	const {
		data: { user },
	} = await supabase.auth.getUser()

	const backend_fetch = create_backend_fetch(supabase)

	return { supabase, session, user, backend_fetch }
}
