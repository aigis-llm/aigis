create extension if not exists "vector" with schema "extensions";


create type "public"."embedding_type" as enum ('bit', 'extensions.vector', 'extensions.halfvec', 'extensions.sparsevec');

create type "public"."index_type" as enum ('l2_ops', 'ip_ops', 'cosine_ops', 'l1_ops', 'bit_hamming_ops', 'bit_jaccard_ops');

create sequence "public"."stores_list_stores_list_id_seq";

create table "public"."stores_list" (
	"stores_list_id" bigint not null default nextval('stores_list_stores_list_id_seq'::regclass),
	"owner" text,
	"name" text,
	"type" embedding_type,
	"dimensions" integer,
	"index_type" index_type,
	"display_name" text
);


alter table "public"."stores_list" enable row level security;

alter sequence "public"."stores_list_stores_list_id_seq" owned by "public"."stores_list"."stores_list_id";

CREATE UNIQUE INDEX stores_list_pkey ON public.stores_list USING btree (stores_list_id);

alter table "public"."stores_list" add constraint "stores_list_pkey" PRIMARY KEY using index "stores_list_pkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_store(store_name text, store_type embedding_type, store_dimensions integer, display_name text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$declare
	table_name text;
begin
	table_name := coalesce(auth.uid()::text, 'admin') || '_' || store_name;
	execute format('create table vector_stores.%s (%s bigserial, embedding %s(%s), contents text);', quote_ident(table_name), quote_ident(table_name || '_id'), store_type, store_dimensions);
	execute format('alter table vector_stores.%s enable row level security;', quote_ident(table_name));
	insert into public.stores_list (owner, name, type, dimensions, display_name) values (coalesce(auth.uid()::text, 'admin'), coalesce(auth.uid()::text, 'admin') || '_' || store_name, store_type, store_dimensions, display_name);
	execute format('create policy "Users can only see their own vector stores" on vector_stores.%s using ((select auth.uid()::text) = %s);', quote_ident(table_name), quote_literal(auth.uid()::text));
	return table_name;
end$function$
;

CREATE OR REPLACE FUNCTION public.index_store(store_name text, index_type index_type)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$#variable_conflict use_variable
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
$function$
;

grant delete on table "public"."stores_list" to "anon";

grant insert on table "public"."stores_list" to "anon";

grant references on table "public"."stores_list" to "anon";

grant select on table "public"."stores_list" to "anon";

grant trigger on table "public"."stores_list" to "anon";

grant truncate on table "public"."stores_list" to "anon";

grant update on table "public"."stores_list" to "anon";

grant delete on table "public"."stores_list" to "authenticated";

grant insert on table "public"."stores_list" to "authenticated";

grant references on table "public"."stores_list" to "authenticated";

grant select on table "public"."stores_list" to "authenticated";

grant trigger on table "public"."stores_list" to "authenticated";

grant truncate on table "public"."stores_list" to "authenticated";

grant update on table "public"."stores_list" to "authenticated";

grant delete on table "public"."stores_list" to "service_role";

grant insert on table "public"."stores_list" to "service_role";

grant references on table "public"."stores_list" to "service_role";

grant select on table "public"."stores_list" to "service_role";

grant trigger on table "public"."stores_list" to "service_role";

grant truncate on table "public"."stores_list" to "service_role";

grant update on table "public"."stores_list" to "service_role";

create policy "Users can only list their own stores"
on "public"."stores_list"
as permissive
for select
to public
using (((( SELECT auth.uid() AS uid))::text = owner));



create schema if not exists "vector_stores";


