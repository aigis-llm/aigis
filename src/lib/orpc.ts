import type { RouterClient } from "@orpc/server"
import { createORPCClient } from "@orpc/client"
import { OpenAPILink } from "@orpc/openapi-client/fetch"
import { os as base } from "@orpc/server"
import { createTanstackQueryUtils } from "@orpc/tanstack-query"
import contract from "$lib/api/orpc-contract.json"
import type router from "$lib/api/router"

const link = new OpenAPILink(contract as typeof router, {
	url: () => {
		if (typeof window === "undefined") {
			throw new TypeError("This link is not allowed on the server side.")
		}

		return `${window.location.origin}/api`
	},
})

export const os = base.$context<{ locals: App.Locals }>()
export const client: RouterClient<typeof router> = globalThis.$client ?? createORPCClient(link)
export const orpc = createTanstackQueryUtils(client)
