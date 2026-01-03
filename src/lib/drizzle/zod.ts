import type { z } from "zod/v4"
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod"
import * as schemas from "./schema"

export const account_select_schema = createSelectSchema(schemas.account)
export const account_insert_schema = createInsertSchema(schemas.account)
export const account_update_schema = createUpdateSchema(schemas.account)

export const goose_db_version_select_schema = createSelectSchema(schemas.goose_db_version)
export const goose_db_version_insert_schema = createInsertSchema(schemas.goose_db_version)
export const goose_db_version_update_schema = createUpdateSchema(schemas.goose_db_version)

export const session_select_schema = createSelectSchema(schemas.session)
export const session_insert_schema = createInsertSchema(schemas.session)
export const session_update_schema = createUpdateSchema(schemas.session)

export const user_select_schema = createSelectSchema(schemas.user)
export const user_insert_schema = createInsertSchema(schemas.user)
export const user_update_schema = createUpdateSchema(schemas.user)

export const verification_select_schema = createSelectSchema(schemas.verification)
export const verification_insert_schema = createInsertSchema(schemas.verification)
export const verification_update_schema = createUpdateSchema(schemas.verification)

export type Account = z.infer<typeof account_select_schema>
export type AccountInsert = z.infer<typeof account_insert_schema>
export type AccountUpdate = z.infer<typeof account_update_schema>

export type GooseDbVersion = z.infer<typeof goose_db_version_select_schema>
export type GooseDbVersionInsert = z.infer<typeof goose_db_version_insert_schema>
export type GooseDbVersionUpdate = z.infer<typeof goose_db_version_update_schema>

export type Session = z.infer<typeof session_select_schema>
export type SessionInsert = z.infer<typeof session_insert_schema>
export type SessionUpdate = z.infer<typeof session_update_schema>

export type User = z.infer<typeof user_select_schema>
export type UserInsert = z.infer<typeof user_insert_schema>
export type UserUpdate = z.infer<typeof user_update_schema>

export type Verification = z.infer<typeof verification_select_schema>
export type VerificationInsert = z.infer<typeof verification_insert_schema>
export type VerificationUpdate = z.infer<typeof verification_update_schema>
