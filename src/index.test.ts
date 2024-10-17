import { describe, it, expect } from "bun:test"
import page from "./routes/+page.svelte"
import { screen, render } from "@testing-library/svelte"

describe("sum test", () => {
	it("adds 1 + 2 to equal 3", () => {
		expect(1 + 2).toBe(3)
	})
})

describe("root page test", () => {
	it("has the correct header", async () => {
		render(page)
		const header = await screen.findByRole("heading")
		expect(header).toBeInTheDocument()
	})
})