install:
	rye sync
	bun install

register-toolchain:
	rye toolchain register --name=patched-nix-cpython `which python3.13`

dev:
	bunx --bun concurrently --kill-others "rye run sanic server --dev --port 8070 --host 0.0.0.0" "bunx --bun vite dev --port 8071 --host 0.0.0.0"

format:
	bunx --bun prettier --write .
	rye format
	nixfmt flake.nix