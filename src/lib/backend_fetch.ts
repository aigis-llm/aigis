import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "$lib/database.types.ts"

export default function create_backend_fetch(supa: SupabaseClient<Database>) {
	return async (input: RequestInfo | URL, init?: RequestInit) => {
		const update: RequestInit = { ...init }
		update.headers = {
			...update.headers,
			Authorization: `Bearer ${(await supa.auth.getSession()).data.session?.access_token || import.meta.env.AIGIS_SUPABSE_KEY}`,
		}
		return await fetch(input, update)
	}
}
