import { test, expect } from "vitest"
import Navbar from "$lib/Navbar.svelte"
import { screen } from "@testing-library/svelte"
import { render } from "$lib/test_utils"

test("Navbar exists", async () => {
	await render(Navbar)
	const myComponent = screen.getByRole("navigation")
	expect(myComponent).toBeInTheDocument()
})
