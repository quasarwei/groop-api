# Groop Server

## Tech stack

Node, Express, Knex, PostgreSQL, Mocha, Chai

## API Endpoints

### Overview

`A` -- requires `Authorization` header using Bearer  
`JSON` -- requires Header `content-type: application/json`

| Method | Endpoint                                                                             | Usage                                         | Returns                   | Header Fields |
| ------ | ------------------------------------------------------------------------------------ | --------------------------------------------- | ------------------------- | ------------- |
| POST   | [/api/auth/token](#post-apiauthtoken)                                                | Authenticate a user                           | JWT                       | JSON          |
| PUT    | /api/auth/token                                                                      | Re-authenticate a user                        | JWT                       | A / JSON      |
| POST   | [/api/users](#post-apiusers)                                                         | Register a new user                           | User Object               | JSON          |
| GET    | [/api/users](#get-apiusers)                                                          | Get account information for logged in user    | User Object               | A / JSON      |
| PATCH  | [/api/users](#patch-apiusers)                                                        | Change account information for logged in user | User Object               | A / JSON      |
| POST   | [/api/users/verify](#post-apiusersverify)                                            | Verify password entered by user               | -                         | A             |
| POST   | [/api/tasks](#post-apitasks)                                                         | Create a new task                             | New Task Object           | A / JSON      |
| GET    | [/api/tasks](#get-apitasks)                                                          | Get all tasks user is assigned to             | Array of task objects     | A / JSON      |
| GET    | [/api/tasks/:group_id](#get-apitasksgroup_id)                                        | Get all tasks in a group                      | Array of task objects     | A / JSON      |
| PATCH  | [/api/tasks/task/:task_id](#patch-apitaskstasktask_id)                               | Edit a task                                   | Edited Task Object        | A / JSON      |
| DELETE | [/api/tasks/task/:task_id](#delete-apitaskstasktask_id)                              | Delete a task                                 | -                         | A             |
| POST   | [/api/categories](#post-apicategories)                                               | Create a task category in a group             | New Category Object       | A / JSON      |
| GET    | /api/categories/group/:group_id                                                      | Get all task categories for a group           | Array of category objects | A / JSON      |
| GET    | [/api/categories/:category_id](#get-apicategoriescategory_id)                        | Get a category by id                          | Category object           | A / JSON      |
| PATCH  | /api/categories/:category_id                                                         | Edit a category                               | Category object           | A / JSON      |
| DELETE | /api/categories/:category_id                                                         | Delete a category                             | -                         | A             |
| GET    | /api/groups/:group_id                                                                | Get a group by id                             | Group Object              | A / JSON      |
| POST   | [/api/groups](#post-apigroups)                                                       | Create a group                                | Object                    | A / JSON      |
| DELETE | [/api/groups/:group_id](#delete-apigroupsgroup_id)                                   | Delete a group                                | -                         | A             |
| POST   | [/api/groupsmembers](#post-apigroupsmembers)                                         | Add a user to a group                         | Object                    | A / JSON      |
| GET    | [/api/groupsmembers](#get-apigroupsmembers)                                          | Get all groups user is a member of            | Array of Group Objects    | A / JSON      |
| GET    | [/api/groupsmembers/:group_id](#get-apigroupsmembersgroup_id)                        | Get all members in a group                    | Array of objects          | A / JSON      |
| DELETE | [/api/groupsmembers/:group_id/:member_id](#delete-apigroupsmembersgroup_idmember_id) | Remove a user from a group                    | -                         | A             |

#### `POST /api/auth/token`

Login

##### Request Body

| Field    | Type   | Description |
| -------- | ------ | ----------- |
| username | String | username    |
| password | String | Password    |

##### OK Response Body

| Field     | Type   | Description |
| --------- | ------ | ----------- |
| authToken | String | JWT         |

#### `GET /api/users`

Get account information for logged in user

##### OK Response Body

| Field         | Type   | Description                   |
| ------------- | ------ | ----------------------------- |
| id            | Int    | Unique user ID                |
| fullname      | String | User's name                   |
| username      | String | User's username               |
| email         | String | email associated with account |
| notifications | Bool   | notification setting for user |

#### `POST /api/users`

Create a new user

##### Request Body

| Field    | Type   | Description                         |
| -------- | ------ | ----------------------------------- |
| fullname | String | User's name                         |
| username | String | User's username                     |
| email    | String | email to be associated with account |
| password | String | Password                            |

#### `PATCH /api/users`

Edit user account information

##### Request Body

| Field    | Type   | Description  |
| -------- | ------ | ------------ |
| fullname | String | New name     |
| email    | String | New email    |
| password | String | New password |

#### `POST /api/users/verify`

Verify password entered by user. Use with a patch call to /api/users to authorize any changes being made to account.
Returns 204 if successful.

##### Request Body

| Field    | Type   | Description                             |
| -------- | ------ | --------------------------------------- |
| password | String | Password to verify with hashed password |

#### `GET /api/tasks`

Get all tasks the user is assigned to

##### OK Response Body

| Field            | Type   | Description                                                               |
| ---------------- | ------ | ------------------------------------------------------------------------- |
| id               | Int    | task id                                                                   |
| name             | String | Name of task                                                              |
| description      | String | Description of task                                                       |
| completed        | Bool   | Defaults to false                                                         |
| creator_id       | Int    | id of user who submitted the task                                         |
| date_due         | String | Date task is to be completed by                                           |
| group_id         | Int    | group id task was created for                                             |
| user_assigned_id | Int    | task's assignee's user id, defaults to null                               |
| category_id      | Int    | id of category task belongs to                                            |
| priority         | Int    | Priority level used for scoring purposes. (1 - Low, 2 - Medium, 3 - High) |
| time_start       | String | optional start time for task                                              |
| category_name    | String | category name of task                                                     |
| group_name       | String | name of group task belongs to                                             |
| username         | String | username of user assigned to task                                         |

##### OK Response Body

| Type  | Description                                  |
| ----- | -------------------------------------------- |
| Array | An array of task objects user is assigned to |

#### `POST /api/tasks`

Submit a new task to a group

##### Request Body

| Field       | Type   | Description                                                               | Required? |
| ----------- | ------ | ------------------------------------------------------------------------- | --------- |
| name        | String | Name of task                                                              | Y         |
| description | String | Description of task                                                       | N         |
| date_due    | String | Date task is to be completed by                                           | Y         |
| group_id    | Int    | group id task is to be created for                                        | Y         |
| category_id | Int    | id of category task belongs to                                            | Y         |
| priority    | Int    | Priority level used for scoring purposes. (1 - Low, 2 - Medium, 3 - High) | Y         |
| time_start  | String | start time for task                                                       | N         |

##### OK Response Body

| Field            | Type   | Description                                                               |
| ---------------- | ------ | ------------------------------------------------------------------------- |
| id               | Int    | task id                                                                   |
| name             | String | Name of task                                                              |
| description      | String | Description of task                                                       |
| completed        | Bool   | Defaults to false                                                         |
| creator_id       | Int    | id of user who submitted the task                                         |
| date_due         | String | Date task is to be completed by                                           |
| group_id         | Int    | group id task was created for                                             |
| user_assigned_id | Int    | task's assignee's user id, defaults to null                               |
| category_id      | Int    | id of category task belongs to                                            |
| priority         | Int    | Priority level used for scoring purposes. (1 - Low, 2 - Medium, 3 - High) |
| time_start       | String | optional start time for task                                              |

#### `GET /api/tasks/:group_id`

Get all tasks in a group. Returns array of task objects.

##### Task object

| Field            | Type   | Description                                                               |
| ---------------- | ------ | ------------------------------------------------------------------------- |
| id               | Int    | task id                                                                   |
| name             | String | Name of task                                                              |
| description      | String | Description of task                                                       |
| completed        | Bool   | Defaults to false                                                         |
| creator_id       | Int    | id of user who submitted the task                                         |
| date_due         | String | Date task is to be completed by                                           |
| group_id         | Int    | group id task was created for                                             |
| user_assigned_id | Int    | task's assignee's user id, defaults to null                               |
| category_id      | Int    | id of category task belongs to                                            |
| priority         | Int    | Priority level used for scoring purposes. (1 - Low, 2 - Medium, 3 - High) |
| time_start       | String | optional start time for task                                              |
| category_name    | String | category name of task                                                     |
| group_name       | String | name of group task belongs to                                             |
| username         | String | username of user assigned to task                                         |

##### Path Parameter

| Path parameter | Description |
| -------------- | ----------- |
| group_id       | group id    |

##### OK Response Body

| Type  | Description                                 |
| ----- | ------------------------------------------- |
| Array | An array of task objects belonging to group |

#### `PATCH /api/tasks/task/:task_id`

Edit a task

##### Path Parameter

| Path parameter | Description     |
| -------------- | --------------- |
| task_id        | task id to edit |

##### Request Body

Body must include at least one item to edit:

| Field            | Type   | Description                              |
| ---------------- | ------ | ---------------------------------------- |
| name             | String | Name of task                             |
| description      | String | Description of task                      |
| date_due         | String | Date task is to be completed by          |
| completed        | Bool   | Completion status                        |
| user_assigned_id | Int    | Id of user to assign task to             |
| category_id      | Int    | Id of category task is to be assigned to |
| priority         | Int    | Priority level of task                   |
| time_start       | String | start time optional                      |
| completed        | Bool   | is task completed?                       |

##### OK Response Body

| Type        | Description                    |
| ----------- | ------------------------------ |
| Task Object | Task object with edited values |

#### `DELETE /api/tasks/task/:task_id`

Delete a task

##### Path Parameter

| Path parameter | Description       |
| -------------- | ----------------- |
| task_id        | task id to delete |

##### Responses

| Code | Description |
| ---- | ----------- |
| 204  | No Content  |

#### `POST /api/categories`

Create a new category

##### Request Body

| Field         | Type   | Description                       |
| ------------- | ------ | --------------------------------- |
| category_name | String | Name of new category              |
| group_id      | Int    | Id of group to create category in |

##### OK Response Body

| Field         | Type   | Description                         |
| ------------- | ------ | ----------------------------------- |
| id            | Int    | id of new category                  |
| category_name | String | Name of new category                |
| group_id      | Int    | Id of group category was created in |

#### `GET /api/categories/:category_id`

Get a category by ID

##### OK Response Body

| Field         | Type   | Description                       |
| ------------- | ------ | --------------------------------- |
| id            | Int    | id of new category                |
| category_name | String | Name of new category              |
| group_id      | Int    | Id of group to create category in |

#### `POST /api/groups`

Create a new group

##### Request Body

| Field | Type   | Description   |
| ----- | ------ | ------------- |
| name  | String | Name of group |

##### OK Response Body

| Field    | Type   | Description         |
| -------- | ------ | ------------------- |
| id       | Int    | task id             |
| name     | String | Name of group       |
| owner_id | Int    | id of group creator |

#### `DELETE /api/groups/:group_id`

Delete a group  
\*only the group's owner can delete the group

#### `POST /api/groupsmembers`

Add a member to a group

##### Request Body

| Field     | Type | Description      |
| --------- | ---- | ---------------- |
| group_id  | Int  | Id of group      |
| member_id | Int  | Id of new member |

##### OK Response Body

| Field     | Type   | Description            |
| --------- | ------ | ---------------------- |
| id        | Int    | groupmember id         |
| group_id  | Int    | Id of group            |
| member_id | Int    | Id of new member       |
| username  | String | username of new member |
| score     | Int    | score of new member    |

#### `GET /api/groupsmembers`

Get all groups user is a part of

##### OK Response Body

| Field    | Type   | Description   |
| -------- | ------ | ------------- |
| name     | String | Name of group |
| group_id | Int    | Id of group   |

#### `GET /api/groupsmembers/:group_id`

Get all members of a group.  
Returns an array of objects containing member information

##### OK Response Object

| Field         | Type   | Description                         |
| ------------- | ------ | ----------------------------------- |
| member_id     | Int    | member id                           |
| score         | Int    | member's score for the group        |
| username      | String | member username                     |
| fullname      | String | member name                         |
| email         | String | member email                        |
| notifications | Bool   | member's user notificaitons setting |
| group_id      | Int    | group id                            |
| name          | String | group name                          |

#### `DELETE /api/groupsmembers/:group_id/:member_id`

Remove a member from a group
