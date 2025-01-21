import { test, expect } from "vitest"
import Navbar from "$lib/Navbar.svelte"
import { screen, render } from "@testing-library/svelte"

test("Navbar exists", () => {
	render(Navbar)
	const myComponent = screen.getByRole("navigation")
	expect(myComponent).toBeInTheDocument()
})
