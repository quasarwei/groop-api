const express = require('express');
const path = require('path');
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
  user_assigned_id: task.user_assigned_id,
  group_id: task.group_id,
});

tasksRouter.get('/', async (req, res, next) => {
  try {
    const tasks = await TasksService.getAllTasks(req.app.get('db'));
    const allTasks = tasks.map(taskFormat);
    res.status(200).json(allTasks);
  } catch (error) {
    next(error);
  }
});

tasksRouter.get('/:group_id', async (req, res, next) => {
  const { group_id } = req.params;
  try {
    const groupTasks = await TasksService.getGroupTasks(
      req.app.get('db'),
      group_id,
    );
    const allGroupTasks = groupTasks.map(taskFormat);
    res.status(200).json(allGroupTasks);
  } catch (error) {
    next(error);
  }
});

tasksRouter.post('/', jsonParser, async (req, res, next) => {
  const { name, description, creator_id, date_due, group_id } = req.body;

  for (const field of [
    'name',
    'description',
    'creator_id',
    'date_due',
    'group_id',
  ])
    if (!req.body[field])
      return res.status(400).json({
        error: `Missing '${field}' in request body`,
      });

  const newTaskInfo = { name, description, creator_id, date_due, group_id };
  try {
    const newTask = await TasksService.postNewTask(
      req.app.get('db'),
      newTaskInfo,
    );
    res
      .status(201)
      .location(path.posix.join(req.originalUrl, `/${newTask.id}`))
      .json(taskFormat(newTask));
  } catch (error) {
    next(error);
  }
});

tasksRouter.patch('/task/:task_id', jsonParser, async (req, res, next) => {
  const { task_id } = req.params;
  const { name, description, date_due, completed, user_assigned_id } = req.body;
  const updateInfo = {
    name,
    description,
    date_due,
    completed,
    user_assigned_id,
  };

  const numberOfValues = Object.values(updateInfo).filter(Boolean).length;
  if (numberOfValues == 0) {
    return res
      .status(400)
      .json({
        error: {
          message: `Request must include at least one item to edit: name, description, date_due, completed, or user_assigned_id`,
        },
      });
  }

  try {
    const updatedTask = await TasksService.updateTask(
      req.app.get('db'),
      task_id,
      updateInfo,
    );
    res.status(200).json(taskFormat(updatedTask));
  } catch (error) {
    next(error);
  }
});

tasksRouter.delete('/task/:task_id', async (req, res, next) => {
  const { task_id } = req.params;
  try {
    const deletedItem = await TasksService.deleteTask(
      req.app.get('db'),
      task_id,
    );
    console.log(deletedItem);
    res.status(204).json(`Task {task_id} was deleted.`);
  } catch (error) {
    next(error);
  }
});

module.exports = tasksRouter;
