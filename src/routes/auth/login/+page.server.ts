import { redirect } from "@sveltejs/kit"
import type { Actions } from "./$types"

export const actions = {
	default: async ({ request, locals: { supabase } }) => {
		const data = await request.formData()
		const email = data.get("email") as string
		const password = data.get("password") as string

		console.log(`${email}, ${password}`)

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		})

		if (error) {
			console.error(error)
			redirect(303, "/auth/error")
		} else {
			redirect(303, "/")
		}
	},
} satisfies Actions
