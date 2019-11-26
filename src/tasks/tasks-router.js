const express = require('express');
const xss = require('xss');
const TasksService = require('./tasks-service.js');

const tasksRouter = express.Router();
const jsonParser = express.json();

const taskFormat = task => ({
  id: task.id,
  taskName: xss(task.name),
  taskDescription: xss(task.description),
  completed: task.completed,
  taskCreator: task.creator_id,
  taskDue: task.date_due,
  personAssigned: task.user_assigned_id,
  groopId: task.groop_id
});

tasksRouter.post('/:groupId', jsonParser, async (req, res, next) => {
  const { name, description, creator_id, due_date, groop_id} = req.body;

  for (const field of ['taskName', 'taskDescription', 'taskCreator', 'taskDue', 'groopId'])
    if (!req.body[field])
      return res.status(400).json({
        error: `Missing '${field}' in request body`,
      });
  
  const newTaskInfo = {name, description, creator_id, due_date, groop_id};
  try {
    const newTask = await TasksService.postNewTask(req.app.get('db'), newTaskInfo);
    res.status(201)
    .location(path.posix.join(req.originalUrl, `/${newTask.id}`))
    .json(taskFormat(newTask))
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