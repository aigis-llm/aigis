/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly AIGIS_BACKEND_URL: string
	readonly AIGIS_FRONTEND_URL: string
	readonly AIGIS_SUPABASE_URL: string
	readonly AIGIS_SUPABSE_KEY: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
