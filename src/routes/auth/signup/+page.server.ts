import type { Actions } from "./$types"
import type { EmailSignupType } from "./schema"
import { redirect } from "@sveltejs/kit"
import { zfd } from "zod-form-data"
import { auth } from "$lib/auth"
import { emailSignupSchema } from "./schema"

export const actions = {
	default: async ({ request }) => {
		const { email, password }: EmailSignupType = zfd.formData(emailSignupSchema).parse(await request.formData())
		await auth.api.signUpEmail({
			body: {
				email,
				name: email,
				password,
			},
		})
		redirect(303, "/")
	},
} satisfies Actions
