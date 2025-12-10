import type { OpenAPI } from "@orpc/contract"
import type { RequestHandler } from "@sveltejs/kit"
import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from "@electric-sql/client"
import { OpenAPIGenerator } from "@orpc/openapi"
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4"
import router from "$lib/api/router"
import electricSpecUntyped from "./electric-api.yaml"

const electricSpec = electricSpecUntyped as OpenAPI.Document

const generator = new OpenAPIGenerator({
	schemaConverters: [
		new ZodToJsonSchemaConverter(),
	],
})

export const GET: RequestHandler = async () => {
	const spec = await generator.generate(router, {
		info: {
			title: "Aigis",
			version: "0.0.0",
		},
		servers: [
			{ url: `${import.meta.env.AIGIS_FRONTEND_URL!}/api` },
		],
	})

	// Deep clone
	const shapeSpec: OpenAPI.OperationObject = JSON.parse(JSON.stringify(electricSpec.paths!["/v1/shape"]!.get!))
	shapeSpec.description = `From [ElectricSQL](https://electric-sql.com/docs/api/http).\n\n${shapeSpec.description}`
	shapeSpec.parameters = shapeSpec.parameters!.filter((param) => {
		if ("name" in param) {
			return [
				...ELECTRIC_PROTOCOL_QUERY_PARAMS,
				"table",
			].includes(param.name)
		} else {
			return false
		}
	})
	if (spec.paths) {
		// @ts-expect-error Something about RequestBodyObject
		spec.paths["/shape"] = {
			get: shapeSpec,
		}
	} else {
		spec.paths = {
			// @ts-expect-error same as above
			"/shape": {
				get: shapeSpec,
			},
		}
	}
	const specJSON = JSON.stringify(spec)
	return new Response(specJSON, {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	})
}
