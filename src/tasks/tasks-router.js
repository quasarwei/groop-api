const express = require('express');
const path = require('path');
const xss = require('xss');
const TasksService = require('./tasks-service.js');
const GroupsMembersService = require('../groupsmembers/groupsmembers-service');

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
  group_id: task.group_id,
  user_assigned_id: task.user_assigned_id,
  category_id: task.category_id,
  priority: task.priority,
  time_start: task.time_start,
  time_end: task.time_end
});

// get all tasks that authorized user is assigned to
tasksRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const userTasks = await TasksService.getTasksByAssignee(
      req.app.get('db'),
      req.user.id
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
  const groupMembership = await TasksService.checkGroupMembership(
    req.app.get('db'),
    group_id,
    member_id
  );
  if (!groupMembership.length) {
    return res.status(400).json({
      error: `Not a valid request`
    });
  }

  try {
    const groupTasks = await TasksService.getGroupTasks(
      req.app.get('db'),
      group_id
    );
    const allGroupTasks = groupTasks.map(taskFormat);
    res.status(200).json(allGroupTasks);
  } catch (error) {
    next(error);
  }
});

tasksRouter.post('/', requireAuth, jsonParser, async (req, res, next) => {
  const {
    name,
    description,
    date_due,
    group_id,
    category_id,
    priority,
    time_start,
    time_end
  } = req.body;

  for (const field of [
    'name',
    'date_due',
    'group_id',
    'category_id',
    'priority'
  ])
    if (!req.body[field])
      return res.status(400).json({
        error: `Missing '${field}' in request body`
      });

  const creator_id = req.user.id;
  //NOTE: a new task is assigned by default to the creator
  const user_assigned_id = creator_id;
  const newTaskInfo = {
    name,
    description,
    creator_id,
    date_due,
    group_id,
    user_assigned_id,
    category_id,
    priority,
    time_start,
    time_end
  };
  try {
    const newTask = await TasksService.postNewTask(
      req.app.get('db'),
      newTaskInfo
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
  .get(async (req, res, next) => {
    res.status(200).json(taskFormat(res.task));
  })
  .patch(jsonParser, async (req, res, next) => {
    const { task_id } = req.params;

    const {
      name,
      description,
      date_due,
      group_id,
      user_assigned_id,
      category_id,
      priority,
      time_start,
      time_end
    } = req.body;
    let completed = req.body.completed ? 'true' : 'false';

    //prevent user from getting tasks for a group they are not a part of
    //start by checking for group_id
    if (!group_id) {
      return res.status(400).json({ error: `Group ID missing` });
    }
    const member_id = req.user.id;
    const groupMembership = await TasksService.checkGroupMembership(
      req.app.get('db'),
      group_id,
      member_id
    );
    if (!groupMembership.length) {
      return res.status(400).json({ error: `Not a valid request` });
    }

    let updateInfo = {
      name,
      description,
      date_due,
      user_assigned_id,
      category_id,
      priority,
      time_start,
      time_end,
      completed
    };

    const numberOfValues = Object.values(updateInfo).filter(Boolean).length;
    if (numberOfValues == 0) {
      return res.status(400).json({
        error: {
          message: `Request must include at least one item to edit: name, description, date_due, completed, user_assigned_id, or category_id`
        }
      });
    }

    updateInfo = {
      ...updateInfo,
      completed: completed === 'true' ? true : false
    };

    try {
      const updatedTask = await TasksService.updateTask(
        req.app.get('db'),
        task_id,
        updateInfo
      );

      if (updatedTask) {
        const newScore = await GroupsMembersService.calculateScore(
          req.app.get('db'),
          updatedTask.group_id,
          updatedTask.user_assigned_id
        );

        const groupmember = await GroupsMembersService.updateScore(
          req.app.get('db'),
          updatedTask.group_id,
          updatedTask.user_assigned_id,
          { score: newScore[0].score }
        );

        res.status(200).json(taskFormat(updatedTask));
      }
    } catch (error) {
      next(error);
    }
  })
  //NEED: prevent users from deleting tasks for other groups
  .delete(async (req, res, next) => {
    const { task_id } = req.params;

    try {
      const deletedItem = await TasksService.deleteTask(
        req.app.get('db'),
        task_id
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
      req.params.task_id
    );
    if (!task)
      return res.status(404).json({
        error: "Task doesn't exist"
      });

    res.task = task;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = tasksRouter;
