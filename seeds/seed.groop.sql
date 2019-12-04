BEGIN;

TRUNCATE groop_users RESTART IDENTITY CASCADE;
TRUNCATE groop_groups RESTART IDENTITY CASCADE;
TRUNCATE groop_groups_members RESTART IDENTITY CASCADE;
TRUNCATE groop_tasks RESTART IDENTITY CASCADE;

INSERT INTO groop_users (username, fullname, password, email)
VALUES
  ('username1', 'first1 last1',
  -- password = 'pass' 
    '$2a$12$bbV7LrRWFzM27uJgcbxTpe9syDnuIGhaiNMDY/ty4m31r8GSSQzUC', 'user1@email.com'),
  ('username2', 'first2 last2', '$2a$12$bbV7LrRWFzM27uJgcbxTpe9syDnuIGhaiNMDY/ty4m31r8GSSQzUC', 'user2@email.com'),
  ('username3', 'first3 last3', '$2a$12$bbV7LrRWFzM27uJgcbxTpe9syDnuIGhaiNMDY/ty4m31r8GSSQzUC', 'user3@email.com'),
  ('username4', 'first4 last4', '$2a$12$bbV7LrRWFzM27uJgcbxTpe9syDnuIGhaiNMDY/ty4m31r8GSSQzUC', 'user4@email.com'),
  ('username5', 'first5 last5', '$2a$12$bbV7LrRWFzM27uJgcbxTpe9syDnuIGhaiNMDY/ty4m31r8GSSQzUC', 'user5@email.com'),
  ('username6', 'first6 last6', '$2a$12$bbV7LrRWFzM27uJgcbxTpe9syDnuIGhaiNMDY/ty4m31r8GSSQzUC','user6@email.com');

INSERT INTO groop_groups (name, owner_id)
VALUES
    ('group1', 1),
    ('group2', 3),
    ('group3', 4),
    ('group4', 1);

INSERT INTO groop_groups_members (group_id, member_id) 
VALUES
    (1, 1),
    (1, 3),
    (1, 4),
    (2, 1),
    (2, 3),
    (2, 4),
    (2, 6),
    (3, 2),
    (3, 3),
    (3, 4),
    (3, 5),
    (4, 1),
    (4, 2),
    (4, 3),
    (4, 4);

INSERT INTO groop_task_categories (category_name, group_id)
VALUES
    ('errands', 1),
    ('outdoor chores', 1),
    ('appointments', 3),
    ('shopping', 2),
    ('indoor jobs', 4),
    ('cooking', 4);
    
INSERT INTO groop_tasks 
    (name, description, creator_id, date_due, group_id, user_assigned_id, category_id, priority)
VALUES 
    ('buy milk', 'get 3 gallons', 3, '12/01/2019', 1, 1, 1, 2),
    ('rake leaves', 'last fall pickup this week', 1, '12/02/2019', 1, 1, 2, 1),
    ('plow the field', 'rain in forecast for weekend', 3, '12/02/2019', 1, null, 2, 3),
    ('feed Nessie', 'use up older feed batch', 4, '12/02/2019', 1, 3, 2, 3),
    ('doctor appointment', 'Suzy, 3pm, at other clinic', 3, '12/01/2019', 3, 3, 3, 3),
    ('get meds for Grandpa', 'pharmacy on 5th St.', 2, '12/01/2019', 3, 5, null, 3),
    ('buy snowblower', 'Toro brand', 4, '12/02/2019', 2, 6, 4, 1),
    ('fix door', 'lower hinge loose', 1, '12/02/2019', 4, 1, 5, 1),
    ('bake cakes', 'need at least 15 for school sale', 2, '12/04/2019', 4, 4, 6, 3);

COMMIT;
