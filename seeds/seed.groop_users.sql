BEGIN;

TRUNCATE
    groop_users
    RESTART IDENTITY CASCADE;

INSERT INTO groop_users (username, fullname, password, email)
VALUES
  ('brock', 'Brock Boutwell', 'password', 'brockb@gmail.com');

COMMIT;
