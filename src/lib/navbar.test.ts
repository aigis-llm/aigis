import { test, expect } from "bun:test"
import Navbar from "./Navbar.svelte"
import { screen, render, cleanup } from "@testing-library/svelte"
import { afterEach } from "bun:test"

afterEach(cleanup)

test("Navbar exists", () => {
	render(Navbar)
	const myComponent = screen.getByRole("navigation")
	expect(myComponent).toBeInTheDocument()
})
