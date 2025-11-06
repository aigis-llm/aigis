alias i := install

install:
	deno install

generate:
	supabase start
	supabase gen types --lang=typescript --local > src/lib/database.types.ts
	@echo "You can run \`supabase stop\` to stop the DB if you wish."

dev:
	deno run -A -- npm:vite dev --port 8071 --host 0.0.0.0

build:
	deno run -A -- npm:vite build

preview:
	deno run -A -- npm:vite preview --port 8071 --host 0.0.0.0

test:
	deno run -A -- npm:vitest run --coverage

lint:
	deno run -A -- npm:prettier --check .
	deno run -A -- npm:eslint .

alias fmt := format

format:
	deno run -A -- npm:prettier --write .
	nixfmt flake.nix
