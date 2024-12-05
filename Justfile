alias i := install

install:
	bun install
	bash patch.sh

generate:
	supabase start
	supabase gen types --lang=typescript --local > src/lib/database.types.ts
	@echo "You can run \`supabase stop\` to stop the DB if you wish."

dev:
	bunx --bun concurrently --kill-others "uvicorn aigis:app --reload --port 8070 --host 0.0.0.0" "bunx --bun vite dev --port 8071 --host 0.0.0.0"

build:
	bunx --bun vite build

preview:
	bunx --bun concurrently --kill-others "uvicorn aigis:app --port 8070 --host 0.0.0.0" "bunx --bun vite preview --port 8071 --host 0.0.0.0"

test:
	bun test #TODO: proper test setup

lint:
	bunx --bun prettier --check .
	bunx --bun eslint . 
	ruff check
	basedpyright src/aigis/

alias fmt := format

format:
	bunx --bun prettier --write .
	ruff format
	nixfmt flake.nix