-- name: GetUser :one
-- SELECT users.*, pronouns.subject_pronoun, pronouns.object_pronoun
SELECT sqlc.embed(users), sqlc.embed(pronouns)
  FROM users
  INNER JOIN pronouns ON users.pronouns_id=pronouns.id
  WHERE users.id=$1;

-- name: GetTestUser :one
SELECT sqlc.embed(users), sqlc.embed(pronouns)
FROM users
INNER JOIN pronouns ON users.pronouns_id=pronouns.id
LIMIT 1;
