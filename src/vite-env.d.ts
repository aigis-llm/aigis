/// <reference types="vite/client" />
import "@testing-library/jest-dom/vitest"

interface ImportMetaEnv {
	readonly AIGIS_BACKEND_URL: string
	readonly AIGIS_FRONTEND_URL: string
	readonly AIGIS_SUPABASE_URL: string
	readonly AIGIS_SUPABSE_KEY: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
