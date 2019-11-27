const express = require('express');
const xss = require('xss');
const TasksService = require('./tasks-service.js');

const tasksRouter = express.Router();
const jsonParser = express.json();

const taskFormat = task => ({
  id: task.id,
  name: xss(task.name),
  description: xss(task.description),
  completed: task.completed,
  creator_id: task.creator_id,
  date_due: task.date_due,
  user_assigned: task.user_assigned_id,
  group_id: task.group_id
});

tasksRouter.post('/:groupId', jsonParser, async (req, res, next) => {
  const { name, description, creator_id, due_date, group_id} = req.body;

  for (const field of ['name', 'description', 'creator_id', 'due_date', 'group_id'])
    if (!req.body[field])
      return res.status(400).json({
        error: `Missing '${field}' in request body`,
      });
  
  const newTaskInfo = {name, description, creator_id, due_date, group_id};
  try {
    const newTask = await TasksService.postNewTask(req.app.get('db'), newTaskInfo);
    res.status(201)
    .location(path.posix.join(req.originalUrl, `/${newTask.id}`))
    .json(taskFormat(newTask));
  } 
  catch (error) {
    next(error);
  }
})

  /*
TasksService.getAllGroupTasks(req.app.get('db'))
.then(tasks => { res.json(tasks.map(taskFormat)) })
*/

module.exports = tasksRouter;