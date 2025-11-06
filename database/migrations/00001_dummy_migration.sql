-- Dummy migration for linters and formatters

-- +goose Up
-- +goose StatementBegin
select 'up SQL query';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
select 'down SQL query';
-- +goose StatementEnd
