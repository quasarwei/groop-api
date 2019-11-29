const express = require('express');
const path = require('path');
const xss = require('xss');
const TasksService = require('./tasks-service.js');

const tasksRouter = express.Router();
const jsonParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');

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

// get all tasks that authorized user is assigned to
tasksRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const userTasks = await TasksService.getTasksByAssignee(
      req.app.get('db'),
      req.user.id,
    );
    const userTasksSanitized = userTasks.map(taskFormat);
    res.status(200).json(userTasksSanitized);
  } catch (error) {
    next(error);
  }
});

tasksRouter.get('/:group_id', requireAuth, async (req, res, next) => {
  const { group_id } = req.params;
  const member_id = req.user.id;

  //prevent user from getting tasks for a group they are not a part of
  const groupMembership = await TasksService.checkGroupMembership(req.app.get('db'), group_id, member_id);
  if(!groupMembership.length){
    return res.status(400).json({
      error: `Not a valid request`,
    });
  }

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

tasksRouter.post('/', requireAuth, jsonParser, async (req, res, next) => {
  const { name, description, date_due, user_assigned_id, group_id } = req.body;

  for (const field of ['name', 'description', 'date_due', 'user_assigned_id', 'group_id'])
    if (!req.body[field])
      return res.status(400).json({
        error: `Missing '${field}' in request body`,
      });

  const creator_id = req.user.id;
  const newTaskInfo = { name, description, creator_id, date_due, user_assigned_id, group_id };
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

tasksRouter
  .route('/task/:task_id')
  .all(requireAuth)
  .all(checkTaskExists)
  // fix patch and delete so user can only edit and delete tasks in a group that they are in
  .patch(jsonParser, async (req, res, next) => {
    const { task_id } = req.params;
    const {
      name,
      description,
      date_due,
      completed,
      user_assigned_id,
    } = req.body;
    const updateInfo = {
      name,
      description,
      date_due,
      completed,
      user_assigned_id,
    };

    const numberOfValues = Object.values(updateInfo).filter(Boolean).length;
    if (numberOfValues == 0) {
      return res.status(400).json({
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
  })

  .delete(async (req, res, next) => {
    const { task_id } = req.params;
    try {
      const deletedItem = await TasksService.deleteTask(
        req.app.get('db'),
        task_id,
      );
      console.log(deletedItem);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

async function checkTaskExists(req, res, next) {
  try {
    const task = await TasksService.getTaskById(
      req.app.get('db'),
      req.params.task_id,
    );
    if (!task)
      return res.status(404).json({
        error: "Task doesn't exist",
      });

    res.task = task;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = tasksRouter;

