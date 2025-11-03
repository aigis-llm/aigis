import { expect, test } from "vitest"
import { requestEvent } from "$lib/test_utils"
import { GET as shape } from "./+server"

test("Needs a table", async () => {
	const req = new Request("http://localhost/api/shape")
	const reqEvent = requestEvent(req)
	await expect(async () => {
		await shape(reqEvent)
	}).rejects.toThrowError(expect.objectContaining({
		status: 400,
		body: {
			message: "Please provide a table",
		},
	}))
})

test("Cannot use a nonexistent table", async () => {
	const req = new Request("http://localhost/api/shape?table=nonexistent_table")
	const reqEvent = requestEvent(req)
	await expect(async () => {
		await shape(reqEvent)
	}).rejects.toThrowError(expect.objectContaining({
		status: 404,
		body: {
			message: "Table nonexistent_table does not exist or is not exposed",
		},
	}))
})

test("Can access the `user` table", async () => {
	const req = new Request("http://localhost/api/shape?table=user&offset=-1")
	const reqEvent = requestEvent(req)
	const response = await shape(reqEvent)
	expect(response.status).toEqual(200)
})
