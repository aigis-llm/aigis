dev:
	bunx --bun concurrently --kill-others "rye run sanic server --dev --port 8070 --host 0.0.0.0" "bunx --bun vite dev --port 8071 --host 0.0.0.0"