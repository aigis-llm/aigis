alias i := install

install:
	deno install

dev:
	tilt up --stream

build:
	deno run -A -- npm:vite build

preview:
	TILT_PREVIEW=yes tilt up --stream

test:
	deno run -A -- npm:vitest run --coverage

lint:
	deno run -A -- npm:eslint .

alias fmt := format

format:
	deno run -A -- npm:eslint --fix .
	nixfmt flake.nix
