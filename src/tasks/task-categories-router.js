const express = require('express');
const xss = require('xss');
const TaskCategoriesService = require('./task-categories-service.js');
const TasksService = require('./tasks-service.js');
const taskCategoriesRouter = express.Router();
const jsonParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');

const categoryFormat = category => ({
  id: category.id,
  category_name: xss(category.category_name),
  group_id: category.group_id
});

taskCategoriesRouter.post('/', requireAuth, jsonParser, async (req, res, next) => {
  const { category_name, group_id } = req.body;

  for (const field of [ 'category_name', 'group_id' ])
    if (!req.body[field])
      return res.status(400).json({ error: `Missing '${field}' in request body` });

  //prevent user from posting a category to a group they are not a part of
  const member_id = req.user.id;
  const groupMembership = await TasksService.checkGroupMembership(
    req.app.get('db'),
    group_id,
    member_id
  );
  if (!groupMembership.length) {
    return res.status(400).json({ error: `Not a valid request` });
  }

  const newCategoryInfo = { category_name, group_id };
  try {
    const newCategory = await TaskCategoriesService.postNewCategory(
      req.app.get('db'),
      newCategoryInfo
    );
    res.status(201).json(categoryFormat(newCategory));
  } catch (error) {
    next(error);
  }
});

taskCategoriesRouter.get('/group/:group_id', requireAuth, async (req, res, next) => {
  try {
    const groupCategories = await TaskCategoriesService.getCategoriesForGroup(
      req.app.get('db'),
      req.params.group_id,
    );
    const categoriesSanitized = groupCategories.map(categoryFormat);
    res.status(200).json(categoriesSanitized);
  } catch (error) {
    next(error);
  }
});

taskCategoriesRouter.get('/:category_id', requireAuth, async (req, res, next) => {
  try {
    const categoryData = await TaskCategoriesService.getCategoryInfo(
      req.app.get('db'),
      req.params.category_id
    );
    console.log(categoryData);
    res.status(200).json(categoryFormat(categoryData));
  } catch (error) {
    next(error);
  }
});

taskCategoriesRouter.route('/:category_id')
  .all(requireAuth)
  .all(checkCategoryExists)
  .patch(jsonParser, async (req, res, next) => {
    const { category_id } = req.params;
    const { category_name, group_id } = req.body;

    //prevent user from editing categories for a group they are not a part of
    //first check for group_id
    if (!group_id) {
      return res.status(400).json({ error: `Group ID missing` });
    }
    const member_id = req.user.id;
    const groupMembership = await TasksService.checkGroupMembership(
      req.app.get('db'),
      group_id,
      member_id,
    );
    if (!groupMembership.length) {
      return res.status(400).json({ error: `Not a valid request` });
    }

    if (!category_name) {
      return res.status(400).json({ error: `Request must include new category name` });
    }
    try {
      let updateInfo = { category_name, group_id };
  
      const updatedCategory = await TaskCategoriesService.updateCategory(
        req.app.get('db'),
        category_id,
        updateInfo,
      );
      res.status(200).json(categoryFormat(updatedCategory));
    } catch (error) {
      next(error);
    }
});

taskCategoriesRouter.delete('/:category_id/:group_id', requireAuth, async (req, res, next) => {
  const { category_id } = req.params;
  const { group_id } = req.params;

  //prevent user from deleting a category if they are not a part of the group
  const member_id = req.user.id;
  const groupMembership = await TasksService.checkGroupMembership(
    req.app.get('db'),
    group_id,
    member_id,
  );
  if (!groupMembership.length) {
    return res.status(400).json({ error: `Not a valid request` });
  }

  try {
    const deletedCategory = await TaskCategoriesService.deleteCategory(
      req.app.get('db'),
      category_id
    );
    console.log(deletedCategory);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

//spare comment
async function checkCategoryExists(req, res, next) {
  try {
    const task = await TaskCategoriesService.getCategoryInfo(
      req.app.get('db'),
      req.params.category_id
    );
    if (!task)
      return res.status(404).json({ error: "Task doesn't exist" });

    res.task = task;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = taskCategoriesRouter;

