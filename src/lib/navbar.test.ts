import { test, expect, afterEach } from "bun:test"
import Navbar from "$lib/Navbar.svelte"
import userEvent from "@testing-library/user-event"
import { screen, cleanup, waitFor } from "@testing-library/svelte"
import { pixel7, render } from "$lib/test_utils"

afterEach(cleanup)

test("Navbar exists", async () => {
	await render(Navbar)
	const nav = screen.getByRole("navigation")
	expect(nav).toBeInTheDocument()
})

test("Navbar is not using a hamburger on desktop", async () => {
	await render(Navbar)
	const hamburger = screen.getByText("Hamburger")
	expect(hamburger).not.toBeVisible()
})

test("Navbar is using a hamburger on mobile", async () => {
	pixel7()
	await render(Navbar)
	const hamburger = screen.getByText("Hamburger")
	expect(hamburger).toBeVisible()
})

test("Navbar opens and closes when the hamburger is clicked", async () => {
	pixel7()
	await render(Navbar)
	const user = userEvent.setup()
	const hamburger = screen.getByText("Hamburger")
	await user.click(hamburger)
	let menu: HTMLElement
	await waitFor(() => {
		menu = screen.getByRole("menu")
		expect(menu).toBeVisible()
		const homelink = screen.getByText("Home")
		expect(homelink).toBeVisible()
		expect(homelink).toHaveRole("link")
		expect(homelink.parentElement).toHaveRole("menuitem")
	})
	await user.click(hamburger)
	await waitFor(() => {
		expect(menu).not.toBeVisible()
	})
})
