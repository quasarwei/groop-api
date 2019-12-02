CREATE TABLE groop_groups_members (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  group_id INTEGER 
    REFERENCES groop_groups(id) ON DELETE CASCADE NOT NULL,
  member_id INTEGER
    REFERENCES groop_users(id) ON DELETE CASCADE NOT NULL 
);
