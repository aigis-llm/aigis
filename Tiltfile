# vim: set ft=starlark: -*- mode: python; -*-

is_preview = os.getenv("TILT_PREVIEW") != None
is_test = os.getenv("TILT_TEST") != None
postgres_dbname = "postgres_test" if is_test else "postgres"

local_resource(
    'create-network',
    cmd='podman network create aigis-dev-network --ignore',
)

local_resource(
	"postgres",
	cmd="podman pull docker.io/postgres:18-alpine",
	serve_cmd=" ".join([
		"podman run",
		"--rm",
		"--net aigis-dev-network",
		"--name aigis-dev-postgres",
		"--volume aigis-dev-postgres-data:/var/lib/postgresql/data:rw,z",
		"-e POSTGRES_PASSWORD=secret-dev-password",
		"-e POSTGRES_DB={}".format(postgres_dbname),
		"-p 8072:5432",
		"docker.io/postgres:18-alpine",
		"-c wal_level=logical",
	]),
)

local_resource(
	"electric",
	# Needed for https://github.com/electric-sql/electric/pull/3268
	cmd="podman pull docker.io/electricsql/electric:canary",
	serve_cmd=" ".join([
		"podman run",
		"--rm",
		"--net aigis-dev-network",
		"--name aigis-dev-electric",
		"-e DATABASE_URL=postgresql://postgres:secret-dev-password@aigis-dev-postgres:5432/{}?sslmode=disable".format(postgres_dbname),
		"-e ELECTRIC_INSECURE=true",
		"-e ELECTRIC_USAGE_REPORTING=false",
		"-e ELECTRIC_FEATURE_FLAGS=allow_subqueries",
		"-p 8073:3000",
		"docker.io/electricsql/electric:latest",
	]),
)

if is_preview:
	local_resource(
		"frontend",
		serve_cmd="deno run -A -- npm:vite preview --port 8071 --host 0.0.0.0",
	)
else:
	local_resource(
		"frontend",
		serve_cmd="deno run -A -- npm:vite dev --port 8071 --host 0.0.0.0",
	)
