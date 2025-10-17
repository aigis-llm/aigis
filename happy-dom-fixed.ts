import type { Environment } from "vitest/environments"
import { builtinEnvironments } from "vitest/environments"

const env: Environment = {
	name: "happy-dom-fixed",
	transformMode: "web",
	setup: async (global, { happyDOM = {} }) => {
		const f = fetch
		const request = Request
		const response = Response
		const headers = Headers
		const url = URL
		const formData = FormData
		const { teardown } = await builtinEnvironments["happy-dom"].setup(global, { happyDOM })
		// without this it tries to use the happyDOM fetch implementation, which causes issues.
		globalThis.fetch = f
		globalThis.Request = request
		globalThis.Response = response
		globalThis.Headers = headers
		globalThis.URL = url
		globalThis.FormData = formData
		return {
			teardown,
		}
	},
}

export default env
