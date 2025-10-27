import { exec } from "node:child_process"
import process from "node:process"
import { promisify } from "node:util"
import postgres from "postgres"

export async function setup() {
	const sql = postgres(process.env.AIGIS_POSTGRES_URL!)
	if (!process.env.TILT_TEST) {
		await sql`drop database if exists postgres_test`
		await sql`create database postgres_test`
	}
	const goose_promise = promisify(exec)("goose up", {
		env: {
			...process.env,
			GOOSE_DBSTRING: "postgresql://postgres:secret-dev-password@localhost:8072/postgres_test",
		},
	})
	await goose_promise
	await sql.end()
}
