import type { RouterClient } from "@orpc/server"
import { createORPCClient } from "@orpc/client"
import { OpenAPILink } from "@orpc/openapi-client/fetch"
import { getRequestEvent } from "$app/server"
import contract from "$lib/api/orpc-contract.json"
import type router from "$lib/api/router"

if (typeof window !== "undefined") {
	throw new TypeError("This file should only be imported on the server")
}

const link = new OpenAPILink(contract as typeof router, {
	url: async () => {
		return `${getRequestEvent().url.origin}/api`
	},
	async fetch(request, init) {
		return getRequestEvent().fetch(request, init)
	},
})

const serverClient: RouterClient<typeof router> = createORPCClient(link)
globalThis.$client = serverClient
