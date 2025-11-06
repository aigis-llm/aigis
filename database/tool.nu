#!/usr/bin/env nu

let $temp_db_dsn = ($env.AIGIS_POSTGRES_URL | url parse | update path "/aigis_dev_migration_temp" | url join)

def --wrapped diff [ ...args ]: nothing -> string {
	psql -q $env.AIGIS_POSTGRES_URL -c "DROP DATABASE IF EXISTS aigis_dev_migration_temp;"
	psql -q $env.AIGIS_POSTGRES_URL -c "CREATE DATABASE aigis_dev_migration_temp;"
	GOOSE_DBSTRING=$temp_db_dsn goose up
	psql $temp_db_dsn -c 'DROP TABLE IF EXISTS "public"."goose_db_version";'
	let $diff = (
		pg-schema-diff plan
			# TODO: find a better way of doing this
			--no-concurrent-index-ops
			--temp-db-dsn $temp_db_dsn
			...$args
	)
	psql -q $env.AIGIS_POSTGRES_URL -c "DROP DATABASE aigis_dev_migration_temp;"
	return $diff
}

def diff_to_goose []: string -> string {
	$in
	| lines
	| skip 1
	| enumerate
	| each {|line|
		match $line.item {
			"/*" => "-- +goose StatementEnd\n\n-- +goose StatementBegin\n/*"
			_ => $line.item
		}
	}
	| str join "\n"
	| str replace --all "\n-- +goose StatementEnd" "-- +goose StatementEnd"
	| prepend "-- +goose StatementBegin\n/*"
	| append "-- +goose StatementEnd"
	| str join "\n"
}

# Tool to help with migrations using goose and stripe/pg-schema-diff
def main [] {
	help main
}

def "main migration-from-schema" [ migration_name: string ] {
	let $migration_path = (
		goose -s create $migration_name sql e+o>|
		| parse "{_} Created new file: {file}"
		| get file
		| get 0
	)
	print $migration_path

	let $diff_up = (diff --from-dsn $temp_db_dsn --to-dir $"($env.FILE_PWD)/schema")
	let $diff_down = (diff --from-dir $"($env.FILE_PWD)/schema" --to-dsn $temp_db_dsn)

	$"-- +goose Up\n($diff_up | diff_to_goose)\n\n-- +goose Down\n($diff_down | diff_to_goose)" | save -f $migration_path
}
