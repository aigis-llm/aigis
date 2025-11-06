alias i := install

install:
	deno install

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
