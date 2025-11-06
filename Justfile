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
	sqlfluff lint database/schema/*.sql
	sqlfluff lint database/migrations/*.sql
	squawk database/schema/*.sql
	squawk database/migrations/*.sql

alias fmt := format

format:
	deno run -A -- npm:eslint --fix .
	sqlfluff fix database/schema/*.sql
	sqlfluff fix database/migrations/*.sql
	nixfmt flake.nix nix/*.nix
