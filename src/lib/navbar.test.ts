import { test, expect, afterEach } from "bun:test"
import Navbar from "$lib/Navbar.svelte"
import { screen, render, cleanup } from "@testing-library/svelte"

afterEach(cleanup)

test("Navbar exists", () => {
	render(Navbar)
	const myComponent = screen.getByRole("navigation")
	expect(myComponent).toBeInTheDocument()
})
