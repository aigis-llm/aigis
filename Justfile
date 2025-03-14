alias i := install

install:
	deno install

generate:
	supabase start
	supabase gen types --lang=typescript --local > src/lib/database.types.ts
	@echo "You can run \`supabase stop\` to stop the DB if you wish."

dev:
	deno run -A -- npm:concurrently --kill-others "uvicorn aigis:app --reload --port 8070 --host 0.0.0.0" "deno run -A -- npm:vite dev --port 8071 --host 0.0.0.0"

build:
	deno run -A -- npm:vite build

preview:
	deno run -A -- npm:concurrently --kill-others "uvicorn aigis:app --port 8070 --host 0.0.0.0" "bunx --bun vite preview --port 8071 --host 0.0.0.0"

test:
	pytest --cov=src/aigis/ --cov-report lcov --cov-report term-missing --junitxml=backend.junit.xml -o junit_family=legacy src/
	deno run -A -- npm:vitest run --coverage

lint:
	deno run -A -- npm:prettier --check .
	deno run -A -- npm:eslint .
	ruff check
	basedpyright src/aigis/
	sqlfluff lint supabase/schemas/

alias fmt := format

format:
	deno run -A -- npm:prettier --write .
	ruff check --select I --fix
	ruff format
	nixfmt flake.nix
	sqlfluff format supabase/schemas/
