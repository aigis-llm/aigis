/// <reference types="vite/client" />
import "@testing-library/jest-dom/vitest"

interface ImportMetaEnv {
	readonly AIGIS_FRONTEND_URL: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
