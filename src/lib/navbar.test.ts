import { test, expect } from "vitest"
import Navbar from "$lib/Navbar.svelte"
import { pixel7, render } from "$lib/test_utils"
import userEvent from "@testing-library/user-event"
import { screen, waitFor } from "@testing-library/svelte"

test("Navbar exists", async () => {
	await render(Navbar)
	const nav = screen.getByRole("navigation")
	expect(nav).toBeInTheDocument()
})

test("Navbar is not using a hamburger on desktop", async () => {
	await render(Navbar)
	const hamburger = screen.getByText("Hamburger")
	await new Promise((_) => setTimeout(_, 10))
	await waitFor(() => {
		expect(hamburger).not.toBeVisible()
	})
})

test("Navbar is using a hamburger on mobile", async () => {
	pixel7()
	await render(Navbar)
	pixel7()
	const hamburger = screen.getByText("Hamburger")
	await new Promise((_) => setTimeout(_, 10))
	await waitFor(() => {
		expect(hamburger).toBeVisible()
	})
})

test("Navbar opens and closes when the hamburger is clicked", async () => {
	pixel7()
	await render(Navbar)
	const user = userEvent.setup()
	pixel7()
	const hamburger = screen.getByText("Hamburger")
	await user.click(hamburger)
	let menu: HTMLElement
	await new Promise((_) => setTimeout(_, 10))
	await waitFor(() => {
		menu = screen.getByRole("menu")
		expect(menu).toBeVisible()
		const homelink = screen.getByText("Home")
		expect(homelink).toBeVisible()
		expect(homelink).toHaveRole("link")
		expect(homelink.parentElement).toHaveRole("menuitem")
	})
	await user.click(hamburger)
	await new Promise((_) => setTimeout(_, 10))
	await waitFor(() => {
		console.log("Callback!")
		expect(menu).not.toBeVisible()
	})
})
