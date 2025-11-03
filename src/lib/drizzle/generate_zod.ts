/* eslint antfu/no-top-level-await: 0 */
import { writeFile } from "node:fs/promises"
import { pascalCase } from "text-case"

const header = `
import type { z } from "zod/v4"
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod"
import * as schemas from "./schema"
`.substring(1)
const schemaStatements: Array<string> = []
const typeStatements: Array<string> = []

// @ts-expect-error We can import TS extensions in Deno
const schemas = await import("./schema.ts")
for (const [name, _] of Object.entries(schemas)) {
	schemaStatements.push(`export const ${name}SelectSchema = createSelectSchema(schemas.${name})`)
	schemaStatements.push(`export const ${name}InsertSchema = createInsertSchema(schemas.${name})`)
	schemaStatements.push(`export const ${name}UpdateSchema = createUpdateSchema(schemas.${name})`)
	schemaStatements.push("")
	typeStatements.push(`export type ${pascalCase(name)} = z.infer<typeof ${name}SelectSchema>`)
	typeStatements.push(`export type ${pascalCase(name)}Insert = z.infer<typeof ${name}InsertSchema>`)
	typeStatements.push(`export type ${pascalCase(name)}Update = z.infer<typeof ${name}UpdateSchema>`)
	typeStatements.push("")
}

const merged = [
	header,
	...schemaStatements,
	...typeStatements,
].join("\n")

await writeFile(`${import.meta.dirname}/zod.ts`, merged, "utf8")
