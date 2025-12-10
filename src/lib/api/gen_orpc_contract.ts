import fs from "node:fs"
import { minifyContractRouter } from "@orpc/contract"
import router from "$lib/api/router"

const minifiedRouter = minifyContractRouter(router)

fs.writeFileSync(`${import.meta.dirname}/orpc-contract.json`, JSON.stringify(minifiedRouter, null, "\t"))
