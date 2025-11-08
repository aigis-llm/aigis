import process from "node:process"
import { drizzle } from "drizzle-orm/postgres-js"

// You can specify any property from the postgres-js connection options
const db = drizzle({
	connection: {
		url: process.env.AIGIS_POSTGRES_URL,
	},
})

export default db
