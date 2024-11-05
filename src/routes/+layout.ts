import type { Database } from "../../database.types.ts"
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

			console.log(await supabase.auth.initialize())

	/**
	 * It's fine to use `getSession` here, because on the client, `getSession` is
	 * safe, and on the server, it reads `session` from the `LayoutData`, which
	 * safely checked the session using `safeGetSession`.
	 */
	const {
		data: { session },
	} = await supabase.auth.getSession()

	console.log(session)

	return { supabase, session }
}
