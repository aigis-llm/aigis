install:
	rye sync
	bun install

register-toolchain:
	rye toolchain register --name=patched-nix-cpython `which python3.13`

dev:
	bunx --bun concurrently --kill-others "rye run sanic server --dev --port 8070 --host 0.0.0.0" "bunx --bun vite dev --port 8071 --host 0.0.0.0"

build:
	bunx --bun vite build

preview:
	bunx --bun concurrently --kill-others "rye run sanic server --port 8070 --host 0.0.0.0" "bunx --bun vite preview --port 8071 --host 0.0.0.0"

check:
	bunx --bun svelte-kit sync
	bunx --bun svelte-check --tsconfig ./tsconfig.json

test:
	bunx --bun vitest

lint:
	bunx --bun prettier --check .
	bunx --bun eslint . 
	rye lint
	rye run mypy src/aigis/ server.py

format:
	bunx --bun prettier --write .
	rye format
	nixfmt flake.nix