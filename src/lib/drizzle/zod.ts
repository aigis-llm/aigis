import type { z } from "zod/v4"
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod"
import * as schemas from "./schema"

export const accountSelectSchema = createSelectSchema(schemas.account)
export const accountInsertSchema = createInsertSchema(schemas.account)
export const accountUpdateSchema = createUpdateSchema(schemas.account)

export const gooseDbVersionSelectSchema = createSelectSchema(schemas.gooseDbVersion)
export const gooseDbVersionInsertSchema = createInsertSchema(schemas.gooseDbVersion)
export const gooseDbVersionUpdateSchema = createUpdateSchema(schemas.gooseDbVersion)

export const sessionSelectSchema = createSelectSchema(schemas.session)
export const sessionInsertSchema = createInsertSchema(schemas.session)
export const sessionUpdateSchema = createUpdateSchema(schemas.session)

export const userSelectSchema = createSelectSchema(schemas.user)
export const userInsertSchema = createInsertSchema(schemas.user)
export const userUpdateSchema = createUpdateSchema(schemas.user)

export const verificationSelectSchema = createSelectSchema(schemas.verification)
export const verificationInsertSchema = createInsertSchema(schemas.verification)
export const verificationUpdateSchema = createUpdateSchema(schemas.verification)

export type Account = z.infer<typeof accountSelectSchema>
export type AccountInsert = z.infer<typeof accountInsertSchema>
export type AccountUpdate = z.infer<typeof accountUpdateSchema>

export type GooseDbVersion = z.infer<typeof gooseDbVersionSelectSchema>
export type GooseDbVersionInsert = z.infer<typeof gooseDbVersionInsertSchema>
export type GooseDbVersionUpdate = z.infer<typeof gooseDbVersionUpdateSchema>

export type Session = z.infer<typeof sessionSelectSchema>
export type SessionInsert = z.infer<typeof sessionInsertSchema>
export type SessionUpdate = z.infer<typeof sessionUpdateSchema>

export type User = z.infer<typeof userSelectSchema>
export type UserInsert = z.infer<typeof userInsertSchema>
export type UserUpdate = z.infer<typeof userUpdateSchema>

export type Verification = z.infer<typeof verificationSelectSchema>
export type VerificationInsert = z.infer<typeof verificationInsertSchema>
export type VerificationUpdate = z.infer<typeof verificationUpdateSchema>
