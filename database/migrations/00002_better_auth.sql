-- +goose Up
-- +goose StatementBegin
/*
Statement 0
*/
set session statement_timeout = 3000;
set session lock_timeout = 3000;
create table public.account (
	"accessTokenExpiresAt" timestamp with time zone,
	"updatedAt" timestamp with time zone not null,
	"createdAt" timestamp with time zone default current_timestamp not null,
	"refreshTokenExpiresAt" timestamp with time zone,
	"idToken" text collate pg_catalog."default",
	"refreshToken" text collate pg_catalog."default",
	id text collate pg_catalog."default" not null,
	"accessToken" text collate pg_catalog."default",
	"userId" text collate pg_catalog."default" not null,
	scope text collate pg_catalog."default",
	password text collate pg_catalog."default",
	"providerId" text collate pg_catalog."default" not null,
	"accountId" text collate pg_catalog."default" not null
);
-- +goose StatementEnd

-- +goose StatementBegin
/*
Statement 1
*/
set session statement_timeout = 3000;
set session lock_timeout = 3000;
create unique index account_pkey on public.account using btree (id);
-- +goose StatementEnd

-- +goose StatementBegin
/*
Statement 2
*/
set session statement_timeout = 3000;
set session lock_timeout = 3000;
alter table public.account add constraint account_pkey primary key using index account_pkey;
-- +goose StatementEnd

-- +goose StatementBegin
/*
Statement 3
*/
set session statement_timeout = 3000;
set session lock_timeout = 3000;
create table public.session (
	"expiresAt" timestamp with time zone not null,
	"createdAt" timestamp with time zone default current_timestamp not null,
	"updatedAt" timestamp with time zone not null,
	id text collate pg_catalog."default" not null,
	token text collate pg_catalog."default" not null,
	"ipAddress" text collate pg_catalog."default",
	"userAgent" text collate pg_catalog."default",
	"userId" text collate pg_catalog."default" not null
);
-- +goose StatementEnd

-- +goose StatementBegin
/*
Statement 4
*/
set session statement_timeout = 3000;
set session lock_timeout = 3000;
create unique index session_pkey on public.session using btree (id);
-- +goose StatementEnd

-- +goose StatementBegin
/*
Statement 5
*/
set session statement_timeout = 3000;
set session lock_timeout = 3000;
alter table public.session add constraint session_pkey primary key using index session_pkey;
-- +goose StatementEnd

-- +goose StatementBegin
/*
Statement 6
*/
set session statement_timeout = 3000;
set session lock_timeout = 3000;
create unique index session_token_key on public.session using btree (token);
-- +goose StatementEnd

-- +goose StatementBegin
/*
Statement 7
*/
set session statement_timeout = 3000;
set session lock_timeout = 3000;
alter table public.session add constraint session_token_key unique using index session_token_key;
-- +goose StatementEnd

-- +goose StatementBegin
/*
Statement 8
*/
set session statement_timeout = 3000;
set session lock_timeout = 3000;
create table public."user" (
	"createdAt" timestamp with time zone default current_timestamp not null,
	"updatedAt" timestamp with time zone default current_timestamp not null,
	"emailVerified" boolean not null,
	id text collate pg_catalog."default" not null,
	name text collate pg_catalog."default" not null,
	email text collate pg_catalog."default" not null,
	image text collate pg_catalog."default"
);
-- +goose StatementEnd

-- +goose StatementBegin
/*
Statement 9
*/
set session statement_timeout = 3000;
set session lock_timeout = 3000;
create unique index user_email_key on public."user" using btree (email);
-- +goose StatementEnd

-- +goose StatementBegin
/*
Statement 10
*/
set session statement_timeout = 3000;
set session lock_timeout = 3000;
alter table public."user" add constraint user_email_key unique using index user_email_key;
-- +goose StatementEnd

-- +goose StatementBegin
/*
Statement 11
*/
set session statement_timeout = 3000;
set session lock_timeout = 3000;
create unique index user_pkey on public."user" using btree (id);
-- +goose StatementEnd

-- +goose StatementBegin
/*
Statement 12
*/
set session statement_timeout = 3000;
set session lock_timeout = 3000;
alter table public."user" add constraint user_pkey primary key using index user_pkey;
-- +goose StatementEnd

-- +goose StatementBegin
/*
Statement 13
*/
set session statement_timeout = 3000;
set session lock_timeout = 3000;
alter table public.account add constraint "account_userId_fkey" foreign key (
	"userId"
) references "user" (id) on delete cascade not valid;
-- +goose StatementEnd

-- +goose StatementBegin
/*
Statement 14
*/
set session statement_timeout = 3000;
set session lock_timeout = 3000;
alter table public.account validate constraint "account_userId_fkey";
-- +goose StatementEnd

-- +goose StatementBegin
/*
Statement 15
*/
set session statement_timeout = 3000;
set session lock_timeout = 3000;
alter table public.session add constraint "session_userId_fkey" foreign key (
	"userId"
) references "user" (id) on delete cascade not valid;
-- +goose StatementEnd

-- +goose StatementBegin
/*
Statement 16
*/
set session statement_timeout = 3000;
set session lock_timeout = 3000;
alter table public.session validate constraint "session_userId_fkey";
-- +goose StatementEnd

-- +goose StatementBegin
/*
Statement 17
*/
set session statement_timeout = 3000;
set session lock_timeout = 3000;
create table public.verification (
	"expiresAt" timestamp with time zone not null,
	"createdAt" timestamp with time zone default current_timestamp not null,
	"updatedAt" timestamp with time zone default current_timestamp not null,
	id text collate pg_catalog."default" not null,
	identifier text collate pg_catalog."default" not null,
	value text collate pg_catalog."default" not null
);
-- +goose StatementEnd

-- +goose StatementBegin
/*
Statement 18
*/
set session statement_timeout = 3000;
set session lock_timeout = 3000;
create unique index verification_pkey on public.verification using btree (id);
-- +goose StatementEnd

-- +goose StatementBegin
/*
Statement 19
*/
set session statement_timeout = 3000;
set session lock_timeout = 3000;
alter table public.verification add constraint verification_pkey primary key using index verification_pkey;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
/*
Statement 0
*/
set session statement_timeout = 3000;
set session lock_timeout = 3000;
alter table public.account drop constraint "account_userId_fkey";
-- +goose StatementEnd

-- +goose StatementBegin
/*
Statement 1
*/
set session statement_timeout = 3000;
set session lock_timeout = 3000;
alter table public.session drop constraint "session_userId_fkey";
-- +goose StatementEnd

-- +goose StatementBegin
/*
Statement 2
  - DELETES_DATA: Deletes all rows in the table (and the table itself)
*/
set session statement_timeout = 1200000;
set session lock_timeout = 3000;
drop table public.account;
-- +goose StatementEnd

-- +goose StatementBegin
/*
Statement 3
  - DELETES_DATA: Deletes all rows in the table (and the table itself)
*/
set session statement_timeout = 1200000;
set session lock_timeout = 3000;
drop table public.session;
-- +goose StatementEnd

-- +goose StatementBegin
/*
Statement 4
  - DELETES_DATA: Deletes all rows in the table (and the table itself)
*/
set session statement_timeout = 1200000;
set session lock_timeout = 3000;
drop table public."user";
-- +goose StatementEnd

-- +goose StatementBegin
/*
Statement 5
  - DELETES_DATA: Deletes all rows in the table (and the table itself)
*/
set session statement_timeout = 1200000;
set session lock_timeout = 3000;
drop table public.verification;
-- +goose StatementEnd
