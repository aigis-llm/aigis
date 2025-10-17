import { z } from "zod/v4"

export const emailSignupSchema = z.object({
	email: z.email(),
	password: z.string(),
})

export type EmailSignupType = z.infer<typeof emailSignupSchema>
