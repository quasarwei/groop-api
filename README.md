# Groop Server

This is a boilerplate project used for starting new projects!

## API Endpoints

### Overview

| Method | Endpoint                                                | Usage                    | Returns     |
| ------ | ------------------------------------------------------- | ------------------------ | ----------- |
| POST   | [/api/auth/token](#apiauthtoken)                        | Authenticate a user      | JWT         |
| PUT    | [/api/auth/token](#apiauthtoken)                        | Re-authenticate a user   | JWT         |
| POST   | [/api/user](#apiuser)                                   | Register a new user      | User Object |
| POST   | [/api/tasks](#post-apitasks)                             | Create a new task        | Object      |
| GET    | [/api/tasks/:group_id](#get-apitasksgroup_id)           | Get all tasks in a group | Object      |
| PATCH  | [/api/tasks/task/:task_id](#patch-apitaskstasktask_id)  | Edit a task              | Object      |
| DELETE | [/api/tasks/task/:task_id](#delete-apitaskstasktask_id) | Delete a task            | -           |
| POST   | [/api/groups](#post-apigroups)                           | Create a group           | Object      |
| POST   | [/api/groupsmembers](#post-apigroupsmembers)             | Add a user to a group    | Object      |

#### `POST /api/tasks`

##### Request Body

| Fields      | Type   | Description                        |
| ----------- | ------ | ---------------------------------- |
| name        | String | Name of task                       |
| description | String | Description of task                |
| creator_id  | Int    | creator's user id                  |
| date_due    | String | Date task is to be completed by    |
| group_id    | Int    | group id task is to be created for |

##### OK Response Body

| Fields           | Type   | Description                                 |
| ---------------- | ------ | ------------------------------------------- |
| id               | Int    | task id                                     |
| name             | String | Name of task                                |
| description      | String | Description of task                         |
| completed        | Bool   | Defaults to false                           |
| creator_id       | Int    | creator's user id                           |
| date_due         | String | Date task is to be completed by             |
| user_assigned_id | Int    | task's assignee's user id, defaults to null |
| group_id         | Int    | group id task was created for               |

#### `GET /api/tasks/:group_id`

##### Path Parameter

| Path parameter | Description |
| -------------- | ----------- |
| group_id       | group id    |

##### OK Response Body

| Type  | Description                                 |
| ----- | ------------------------------------------- |
| Array | An array of task objects belonging to group |

#### `PATCH /api/tasks/task/:task_id`

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

##### Path Parameter

| Path parameter | Description       |
| -------------- | ----------------- |
| task_id        | task id to delete |

##### Responses

| Code | Description |
| ---- | ----------- |
| 204  | No Content  |

#### `POST /api/groups`

#### `POST /api/groupsmembers`
