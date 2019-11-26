BEGIN;

TRUNCATE
    groop_users
    RESTART IDENTITY CASCADE;

TRUNCATE
    groop_groups
    RESTART IDENTITY CASCADE;

TRUNCATE 
    groop_tasks
    RESTART IDENTITY CASCADE;


INSERT INTO groop_users (username, fullname, password, email)
VALUES
  ('username1', 'first1 last1', 'password', 'user1@email.com'),
  ('username2', 'first2 last2', 'password', 'user2@email.com'),
  ('username3', 'first3 last3', 'password', 'user3@email.com');
  ('username4', 'first4 last4', 'password', 'user4@email.com');
  ('username5', 'first5 last5', 'password', 'user5@email.com');
  ('username6', 'first6 last6', 'password', 'user6@email.com');

INSERT INTO groop_groups ()

COMMIT;
