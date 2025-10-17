import process from "node:process"
import { betterAuth } from "better-auth"
import { sveltekitCookies } from "better-auth/svelte-kit"
import { PostgresJSDialect } from "kysely-postgres-js"
import postgres from "postgres"
import { getRequestEvent } from "$app/server"

export const auth = betterAuth({
	database: {
		dialect: new PostgresJSDialect({
			postgres: postgres(process.env.AIGIS_POSTGRES_URL!),
		}),
		type: "postgres",
		transaction: true,
	},

	plugins: [sveltekitCookies(getRequestEvent)],

	emailAndPassword: {
		enabled: true,
	},

	baseURL: process.env.AIGIS_FRONTEND_URL!,

	telemetry: {
		enabled: false,
	},
})
