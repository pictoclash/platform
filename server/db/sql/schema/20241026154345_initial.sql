-- +goose Up
-- +goose StatementBegin
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS pronouns (
  id bigserial NOT NULL PRIMARY KEY,
  subject_pronoun TEXT NOT NULL,
  object_pronoun TEXT NOT NULL
);

INSERT INTO
  pronouns (subject_pronoun, object_pronoun)
VALUES
  ('they', 'them'),
  ('he', 'him'),
  ('she', 'her');

CREATE TABLE IF NOT EXISTS clash_events (
  id bigserial NOT NULL PRIMARY KEY,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clash_teams (
  id bigserial NOT NULL PRIMARY KEY,
  team_name TEXT NOT NULL,
  clash_event_id BIGINT NOT NULL REFERENCES clash_events (id)
);

CREATE TABLE IF NOT EXISTS users (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4 (),
  username TEXT NOT NULL UNIQUE,
  bio TEXT,
  pronouns_id BIGINT REFERENCES pronouns (id),
  custom_pronouns TEXT
);

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS users;

DROP TABLE IF EXISTS clash_teams;

DROP TABLE IF EXISTS clash_events;

DROP TABLE IF EXISTS pronouns;

DROP EXTENSION IF EXISTS "uuid-ossp";

-- +goose StatementEnd
