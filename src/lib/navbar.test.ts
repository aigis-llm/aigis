import { test, expect } from "bun:test"
import Navbar from "./Navbar.svelte"
import { screen, cleanup } from "@testing-library/svelte"
import { afterEach } from "bun:test"
import { render } from "$lib/test_utils"

afterEach(cleanup)

test("Navbar exists", () => {
	render(Navbar)
	const myComponent = screen.getByRole("navigation")
	expect(myComponent).toBeInTheDocument()
})
