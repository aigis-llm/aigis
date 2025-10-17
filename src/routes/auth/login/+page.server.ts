import type { Actions } from "./$types"
import type { EmailLoginType } from "./schema"
import { redirect } from "@sveltejs/kit"
import { zfd } from "zod-form-data"
import { auth } from "$lib/auth"
import { emailLoginSchema } from "./schema"

export const actions = {
	default: async ({ request }) => {
		const { email, password }: EmailLoginType = zfd.formData(emailLoginSchema).parse(await request.formData())
		await auth.api.signInEmail({
			body: {
				email,
				password,
			},
		})
		redirect(303, "/")
	},
} satisfies Actions
