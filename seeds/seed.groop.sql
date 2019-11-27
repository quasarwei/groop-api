BEGIN;

TRUNCATE groop_users RESTART IDENTITY CASCADE;
TRUNCATE groop_groups RESTART IDENTITY CASCADE;
TRUNCATE groop_groups_members RESTART IDENTITY CASCADE;
TRUNCATE groop_tasks RESTART IDENTITY CASCADE;

INSERT INTO groop_users (username, fullname, password, email)
VALUES
  ('username1', 'first1 last1', 'password', 'user1@email.com'),
  ('username2', 'first2 last2', 'password', 'user2@email.com'),
  ('username3', 'first3 last3', 'password', 'user3@email.com'),
  ('username4', 'first4 last4', 'password', 'user4@email.com'),
  ('username5', 'first5 last5', 'password', 'user5@email.com'),
  ('username6', 'first6 last6', 'password', 'user6@email.com');

INSERT INTO groop_groups (name, owner_id)
VALUES
    ('group1', 1),
    ('group2', 3),
    ('group3', 4);

INSERT INTO groop_groups_members (group_id, member_id) 
VALUES
    (1, 1),
    (1, 3),
    (1, 4),
    (2, 1),
    (2, 4),
    (2, 6),
    (3, 2),
    (3, 3),
    (3, 4),
    (3, 5);

INSERT INTO groop_tasks (name, description, creator_id, date_due, user_assigned_id, group_id)
VALUES 
    ('buy milk', 'get 3 gallons', 3, '12/01/2019', 1, 1),
    ('rake leaves', 'urgent: last pickup coming up', 1, '12/02/2019', 1, 1),
    ('doctor appointment', 'Suzy, 3pm, at other clinic', 3, '12/01/2019', 3, 3),
    ('buy snowblower', 'Toro brand', 4, '12/02/2019', 2, 2);

COMMIT;
