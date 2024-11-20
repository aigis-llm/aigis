alias i := install

install:
	rye sync
	bun install
	bash patch.sh

register-toolchain:
	rye toolchain register --name=patched-nix-cpython `which python3.13`

generate:
	supabase start
	supabase gen types --lang=typescript --local > src/lib/database.types.ts
	@echo "You can run \`supabase stop\` to stop the DB if you wish."

dev:
	bunx --bun concurrently --kill-others "rye run fastapi dev --port 8070 --host 0.0.0.0 src/aigis/__init__.py" "bunx --bun vite dev --port 8071 --host 0.0.0.0"

build:
	bunx --bun vite build

preview:
	bunx --bun concurrently --kill-others "rye run fastapi run --port 8070 --host 0.0.0.0 src/aigis/__init__.py" "bunx --bun vite preview --port 8071 --host 0.0.0.0"

test:
	bun test #TODO: proper test setup

lint:
	bunx --bun prettier --check .
	bunx --bun eslint . 
	rye lint
	rye run mypy src/aigis/ server.py

alias fmt := format

format:
	bunx --bun prettier --write .
	rye format
	nixfmt flake.nix