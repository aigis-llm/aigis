import { z } from "zod/v4"

export const emailLoginSchema = z.object({
	email: z.email(),
	password: z.string(),
})

export type EmailLoginType = z.infer<typeof emailLoginSchema>
