CREATE TABLE groop_tasks (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  name VARCHAR (128) NOT NULL,
  description VARCHAR (512),
  completed BOOLEAN DEFAULT false NOT NULL,
  creator_id INTEGER 
    REFERENCES groop_users(id) ON DELETE CASCADE NOT NULL,
  date_due TIMESTAMP NOT NULL,
  group_id INTEGER
    REFERENCES groop_groups(id) ON DELETE CASCADE NOT NULL,
  user_assigned_id INTEGER
    REFERENCES groop_users(id) ON DELETE CASCADE,
  priority INTEGER NOT NULL,
  time_start TIMESTAMP
);
