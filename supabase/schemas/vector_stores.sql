create extension if not exists vector with schema extensions;


create type public.embedding_type as enum (
	'bit', 'extensions.vector', 'extensions.halfvec', 'extensions.sparsevec'
);

create type public.index_type as enum (
	'l2_ops',
	'ip_ops',
	'cosine_ops',
	'l1_ops',
	'bit_hamming_ops',
	'bit_jaccard_ops'
);

create table public.stores_list (
	stores_list_id bigserial primary key not null,
	owner text,
	name text,
	type embedding_type,
	dimensions integer,
	index_type index_type,
	display_name text
);

alter table public.stores_list enable row level security;

create policy "Users can only list their own stores"
on public.stores_list
as permissive
for select
to public
using ((((select auth.uid() as uid))::text = owner));

set check_function_bodies = off;

create or replace function public.create_store(
	store_name text,
	store_type embedding_type,
	store_dimensions integer,
	display_name text
)
returns text
language plpgsql
security definer
set search_path to ''
as $function$declare
	table_name text;
begin
	table_name := coalesce(auth.uid()::text, 'admin') || '_' || store_name;
	execute format('create table vector_stores.%s (%s bigserial, embedding %s(%s), contents text);', quote_ident(table_name), quote_ident(table_name || '_id'), store_type, store_dimensions);
	execute format('alter table vector_stores.%s enable row level security;', quote_ident(table_name));
	insert into public.stores_list (owner, name, type, dimensions, display_name) values (coalesce(auth.uid()::text, 'admin'), coalesce(auth.uid()::text, 'admin') || '_' || store_name, store_type, store_dimensions, display_name);
	execute format('create policy "Users can only see their own vector stores" on vector_stores.%s using ((select auth.uid()::text) = %s);', quote_ident(table_name), quote_literal(auth.uid()::text));
	return table_name;
end$function$;

create or replace function public.index_store(
	store_name text, index_type index_type
)
returns text
language plpgsql
security definer
set search_path = ''
as $$#variable_conflict use_variable
declare
	table_type text;
	index record;
begin
	table_type := (select type from public.stores_list where name = store_name);
		for index in select indexname as index_name from pg_indexes
			where schemaname = 'vector_stores' and tablename = store_name loop
					execute format('drop index vector_stores.%s;', quote_ident(index.index_name));
			end loop;
	if (starts_with(index_type::text, 'bit') and table_type = 'bit') then
		execute format('create index on vector_stores.%s using hnsw (embedding extensions.%s);', quote_ident(store_name), index_type);
	elsif not (not (table_type = 'bit') and starts_with(index_type::text, 'bit')) then
		execute format('create index on vector_stores.%s using hnsw (embedding extensions.%s_%s);', quote_ident(store_name), (select right(table_type, length(table_type)-11)), index_type);
	else
		raise exception 'wrong index type %, store is of type %.', index_type, table_type;
	end if;
	update public.stores_list set index_type = index_type where name = store_name;
	return '';
end
$$;

create schema if not exists vector_stores;

grant usage on schema vector_stores to authenticated, service_role;
grant all privileges on all tables in schema vector_stores to authenticated,
service_role;
grant all privileges on all routines in schema vector_stores to authenticated,
service_role;
grant all privileges on all sequences in schema vector_stores to authenticated,
service_role;
alter default privileges for role postgres in schema vector_stores grant all on tables to authenticated,
service_role;
alter default privileges for role postgres in schema vector_stores grant all on routines to authenticated,
service_role;
alter default privileges for role postgres in schema vector_stores grant all on sequences to authenticated,
service_role;
