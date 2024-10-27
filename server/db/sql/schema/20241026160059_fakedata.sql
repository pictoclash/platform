-- +goose Up
-- +goose StatementBegin
INSERT INTO clash_events (id) VALUES (1);

INSERT INTO clash_teams (team_name, clash_event_id)
VALUES
  ('Sun', 1),
  ('Moon', 1);

INSERT INTO users (username, bio, pronouns_id)
VALUES
  ('testuser', 'This is a fake test user. For testing!', 1);

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DELETE FROM users WHERE username='testuser';

DELETE FROM clash_teams WHERE
  team_name IN ('Sun', 'Moon') AND
  clash_event_id=1;

DELETE FROM clash_events WHERE id=1;

-- +goose StatementEnd
