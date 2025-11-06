import { getByText, screen, waitFor } from "@testing-library/svelte"
import userEvent from "@testing-library/user-event"
import { expect, test } from "vitest"
import SelectTest from "$lib/Select.test.svelte"
import { render } from "$lib/test_utils"

test("Select exists", async () => {
	await render(SelectTest)
	const select = screen.getByRole("combobox")
	expect(select).toBeInTheDocument()
})

test("Select opens when clicked", async () => {
	await render(SelectTest)
	const user = userEvent.setup()
	const select = screen.getByRole("combobox")
	await user.click(select)
	let listbox: HTMLElement
	let aliceOption: HTMLElement
	await waitFor(() => {
		listbox = screen.getByRole("listbox")
		expect(listbox).toBeVisible()
		aliceOption = getByText(listbox, "Alice")
		expect(aliceOption).toBeVisible()
		expect(aliceOption).toHaveRole("option")
		expect(aliceOption).toHaveAttribute("aria-selected", "true")
	})
})
