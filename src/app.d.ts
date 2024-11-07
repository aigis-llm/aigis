// See https://kit.svelte.dev/docs/types#app

import type { Session, SupabaseClient, User } from "@supabase/supabase-js"
import type { Database } from "../database.types.ts"

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient<Database>
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>
			session: Session | null
			user: User | null
			backend_fetch: Fetch
		}
		interface PageData {
			session: Session | null
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {}
