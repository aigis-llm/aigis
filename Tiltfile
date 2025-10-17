# vim: set ft=starlark: -*- mode: python; -*-

is_preview = os.getenv("TILT_PREVIEW") != None
is_test = os.getenv("TILT_TEST") != None

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
