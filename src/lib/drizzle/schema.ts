import { sql } from "drizzle-orm"
import { bigint, boolean, check, foreignKey, integer, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core"

export const gooseDbVersion = pgTable("goose_db_version", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "goose_db_version_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	versionId: bigint("version_id", { mode: "number" }).notNull(),
	isApplied: boolean("is_applied").notNull(),
	tstamp: timestamp({ mode: "string" }).defaultNow().notNull(),
}, table => [
	check("goose_db_version_id_not_null", sql`NOT NULL id`),
	check("goose_db_version_version_id_not_null", sql`NOT NULL version_id`),
	check("goose_db_version_is_applied_not_null", sql`NOT NULL is_applied`),
	check("goose_db_version_tstamp_not_null", sql`NOT NULL tstamp`),
])

export const user = pgTable("user", {
	createdAt: timestamp({ withTimezone: true, mode: "string" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: "string" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	emailVerified: boolean().notNull(),
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	image: text(),
}, table => [
	unique("user_email_key").on(table.email),
	check("user_createdAt_not_null", sql`NOT NULL "createdAt"`),
	check("user_updatedAt_not_null", sql`NOT NULL "updatedAt"`),
	check("user_emailVerified_not_null", sql`NOT NULL "emailVerified"`),
	check("user_id_not_null", sql`NOT NULL id`),
	check("user_name_not_null", sql`NOT NULL name`),
	check("user_email_not_null", sql`NOT NULL email`),
])

export const account = pgTable("account", {
	accessTokenExpiresAt: timestamp({ withTimezone: true, mode: "string" }),
	updatedAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
	createdAt: timestamp({ withTimezone: true, mode: "string" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	refreshTokenExpiresAt: timestamp({ withTimezone: true, mode: "string" }),
	idToken: text(),
	refreshToken: text(),
	id: text().primaryKey().notNull(),
	accessToken: text(),
	userId: text().notNull(),
	scope: text(),
	password: text(),
	providerId: text().notNull(),
	accountId: text().notNull(),
}, table => [
	foreignKey({
		columns: [table.userId],
		foreignColumns: [user.id],
		name: "account_userId_fkey",
	}).onDelete("cascade"),
	check("account_updatedAt_not_null", sql`NOT NULL "updatedAt"`),
	check("account_createdAt_not_null", sql`NOT NULL "createdAt"`),
	check("account_id_not_null", sql`NOT NULL id`),
	check("account_userId_not_null", sql`NOT NULL "userId"`),
	check("account_providerId_not_null", sql`NOT NULL "providerId"`),
	check("account_accountId_not_null", sql`NOT NULL "accountId"`),
])

export const session = pgTable("session", {
	expiresAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
	createdAt: timestamp({ withTimezone: true, mode: "string" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
	id: text().primaryKey().notNull(),
	token: text().notNull(),
	ipAddress: text(),
	userAgent: text(),
	userId: text().notNull(),
}, table => [
	foreignKey({
		columns: [table.userId],
		foreignColumns: [user.id],
		name: "session_userId_fkey",
	}).onDelete("cascade"),
	unique("session_token_key").on(table.token),
	check("session_expiresAt_not_null", sql`NOT NULL "expiresAt"`),
	check("session_createdAt_not_null", sql`NOT NULL "createdAt"`),
	check("session_updatedAt_not_null", sql`NOT NULL "updatedAt"`),
	check("session_id_not_null", sql`NOT NULL id`),
	check("session_token_not_null", sql`NOT NULL token`),
	check("session_userId_not_null", sql`NOT NULL "userId"`),
])

export const verification = pgTable("verification", {
	expiresAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
	createdAt: timestamp({ withTimezone: true, mode: "string" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: "string" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
}, table => [
	check("verification_expiresAt_not_null", sql`NOT NULL "expiresAt"`),
	check("verification_createdAt_not_null", sql`NOT NULL "createdAt"`),
	check("verification_updatedAt_not_null", sql`NOT NULL "updatedAt"`),
	check("verification_id_not_null", sql`NOT NULL id`),
	check("verification_identifier_not_null", sql`NOT NULL identifier`),
	check("verification_value_not_null", sql`NOT NULL value`),
])
