# Groop Server

## API Endpoints

### Overview

`A` -- requires `Authorization` header using Bearer  
`JSON` -- requires Header `content-type: application/json`

| Method | Endpoint                                                                             | Usage                              | Returns                | Header Fields |
| ------ | ------------------------------------------------------------------------------------ | ---------------------------------- | ---------------------- | ------------- |
| POST   | [/api/auth/token](#apiauthtoken)                                                     | Authenticate a user                | JWT                    | JSON          |
| PUT    | [/api/auth/token](#apiauthtoken)                                                     | Re-authenticate a user             | JWT                    | A             |
| POST   | [/api/user](#apiuser)                                                                | Register a new user                | User Object            | JSON          |
| POST   | [/api/tasks](#post-apitasks)                                                         | Create a new task                  | New Task Object        | A / JSON      |
| GET    | [/api/tasks](#get-apitasks)                                                          | Get all tasks user is assigned to  | Array of task objects  | A             |
| GET    | [/api/tasks/:group_id](#get-apitasksgroup_id)                                        | Get all tasks in a group           | Array of task objects  | A             |
| PATCH  | [/api/tasks/task/:task_id](#patch-apitaskstasktask_id)                               | Edit a task                        | Edited Task Object     | A / JSON      |
| DELETE | [/api/tasks/task/:task_id](#delete-apitaskstasktask_id)                              | Delete a task                      | -                      | A             |
| POST   | [/api/groups](#post-apigroups)                                                       | Create a group                     | Object                 | A / JSON      |
| DELETE | [/api/groups/:group_id](#delete-apigroupsgroup_id)                                   | Delete a group                     | -                      | A             |
| POST   | [/api/groupsmembers](#post-apigroupsmembers)                                         | Add a user to a group              | Object                 | A / JSON      |
| GET    | [/api/groupsmembers](#get-apigroupsmembers)                                          | Get all groups user is a member of | Array of Group Objects | A             |
| GET    | [/api/groupsmembers/:group_id](#get-apigroupsmembersgroup_id)                        | Get all members in a group         | Array of objects       | A             |
| DELETE | [/api/groupsmembers/:group_id/:member_id](#delete-apigroupsmembersgroup_idmember_id) | Remove a user from a group         | -                      | A             |

#### `GET /api/tasks`

Get all tasks the user is assigned to

##### OK Response Body

| Type  | Description                                  |
| ----- | -------------------------------------------- |
| Array | An array of task objects user is assigned to |

#### `POST /api/tasks`

Submit a new task to a group

##### Request Body

| Fields      | Type   | Description                        |
| ----------- | ------ | ---------------------------------- |
| name        | String | Name of task                       |
| description | String | Description of task                |
| date_due    | String | Date task is to be completed by    |
| group_id    | Int    | group id task is to be created for |

##### OK Response Body

| Fields           | Type   | Description                                 |
| ---------------- | ------ | ------------------------------------------- |
| id               | Int    | task id                                     |
| name             | String | Name of task                                |
| description      | String | Description of task                         |
| completed        | Bool   | Defaults to false                           |
| creator_id       | Int    | id of user who submitted the task           |
| date_due         | String | Date task is to be completed by             |
| user_assigned_id | Int    | task's assignee's user id, defaults to null |
| group_id         | Int    | group id task was created for               |

#### `GET /api/tasks/:group_id`

Get all tasks in a group

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

| Fields           | Type   | Description                     |
| ---------------- | ------ | ------------------------------- |
| name             | String | Name of task                    |
| description      | String | Description of task             |
| date_due         | String | Date task is to be completed by |
| completed        | Bool   | Completion status               |
| user_assigned_id | Int    | Id of user to assign task to    |

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

#### `POST /api/groups`

Create a new group

##### Request Body

| Fields | Type   | Description   |
| ------ | ------ | ------------- |
| name   | String | Name of group |

##### OK Response Body

| Fields   | Type   | Description         |
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

| Fields    | Type | Description      |
| --------- | ---- | ---------------- |
| group_id  | Int  | Id of group      |
| member_id | Int  | Id of new member |

##### OK Response Body

| Fields    | Type | Description      |
| --------- | ---- | ---------------- |
| id        | Int  | groupmember id   |
| group_id  | Int  | Id of group      |
| member_id | Int  | Id of new member |

#### `GET /api/groupsmembers`

Get all groups user is a part of

#### `GET /api/groupsmembers/:group_id`

Get all members of a group.  
Returns an array of objects containing member information

##### OK Response Object

| Fields    | Type   | Description     |
| --------- | ------ | --------------- |
| member_id | Int    | member id       |
| username  | String | member username |
| fullname  | String | member name     |
| group_id  | Int    | group id        |
| name      | String | group name      |

#### `DELETE /api/groupsmembers/:group_id/:member_id`

Remove a member from a group
