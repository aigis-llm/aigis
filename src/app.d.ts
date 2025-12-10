/* eslint-disable vars-on-top */
// See https://svelte.dev/docs/kit/types#app.d.ts

import type { RouterClient } from "@orpc/server"
import type { Session, User } from "better-auth"
import type router from "$lib/api/router"

// for information about these interfaces
declare global {
	var $client: RouterClient<typeof router> | undefined
	namespace App {
		// interface Error {}
		interface Locals {
			session: Session | null
			user: User | null
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {}
