import process from "node:process"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.AIGIS_POSTGRES_URL!,
	},
	out: "./src/lib/drizzle",
})
