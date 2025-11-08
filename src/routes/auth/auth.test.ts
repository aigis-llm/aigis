import type { RequestEvent } from "@sveltejs/kit"
import type { HTMLFormElement } from "happy-dom"
import { screen } from "@testing-library/svelte"
import * as cookie from "cookie"
import { FormData as HappyFormData } from "happy-dom"
import { expect, test, vi } from "vitest"
import type { RouteParams } from "$app/types"
import { happyDOMFormDataToNativeDenoFormData, mockGetRequestEvent, render, requestEvent } from "$lib/test_utils"
import { actions as login_actions } from "./login/+page.server"
import LoginPage from "./login/+page.svelte"
import { GET as logout } from "./logout/+server"
import { actions as signup_actions } from "./signup/+page.server"
import SignupPage from "./signup/+page.svelte"

mockGetRequestEvent()

const userEmail = "alice@example.com"
const userPassword = "password"
let userToken = ""

test("Can sign up", async () => {
	await render(SignupPage)
	const form = screen.getByTestId("signup-form") as unknown as HTMLFormElement
	const formSubmit = vi.fn().mockImplementation(async (event: SubmitEvent) => {
		event.preventDefault()
	})
	form.addEventListener("submit", formSubmit)
	const email = screen.getByLabelText("Email") as HTMLInputElement
	const password = screen.getByLabelText("Password") as HTMLInputElement
	email.value = userEmail
	password.value = userPassword
	form.requestSubmit()
	const formData = happyDOMFormDataToNativeDenoFormData(new HappyFormData(form))
	const req = new Request("http://localhost/auth?signup", { method: "POST", body: formData })
	const reqEvent = requestEvent(req)
	await expect(async () => {
		await signup_actions.default(reqEvent as RequestEvent<RouteParams<"/auth/signup">, "/auth/signup">)
	}).rejects.toThrowError(expect.objectContaining({
		status: 303,
		location: "/",
	}))
	// @ts-expect-error changedCookies is custom for tests
	userToken = reqEvent.changedCookies["better-auth.session_token"]
})

test("Can log in after sign up", async () => {
	await render(LoginPage)
	const form = screen.getByTestId("login-form") as unknown as HTMLFormElement
	const formSubmit = vi.fn().mockImplementation(async (event: SubmitEvent) => {
		event.preventDefault()
	})
	form.addEventListener("submit", formSubmit)
	const email = screen.getByLabelText("Email") as HTMLInputElement
	const password = screen.getByLabelText("Password") as HTMLInputElement
	email.value = userEmail
	password.value = userPassword
	form.requestSubmit()
	const formData = happyDOMFormDataToNativeDenoFormData(new HappyFormData(form))
	const req = new Request("http://localhost/auth?login", { method: "POST", body: formData })
	await expect(async () => {
		await login_actions.default(requestEvent(req))
	}).rejects.toThrowError(expect.objectContaining({
		status: 303,
		location: "/",
	}))
})

test("Can log out", async () => {
	const req = new Request("http://localhost/auth/logout", {
		method: "GET",
		credentials: "include",
		headers: {
			Cookie: cookie.serialize("better-auth.session_token", userToken),
		},
	})
	await expect(async () => {
		await logout(requestEvent(req))
	}).rejects.toThrowError(expect.objectContaining({
		status: 303,
		location: "/",
	}))
})
