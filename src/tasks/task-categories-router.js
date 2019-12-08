const express = require('express');
const xss = require('xss');
const TasksService = require('./tasks-service.js');
const taskCategoriesRouter = express.Router();
const jsonParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');
const TaskCategoriesService = require('./task-categories-service.js');

const categoryFormat = category => ({
  id: category.id,
  category_name: xss(category.category_name),
  group_id: category.group_id,
});

taskCategoriesRouter.post(
  '/',
  requireAuth,
  jsonParser,
  async (req, res, next) => {
    const { category_name, group_id } = req.body;

    for (const field of ['category_name', 'group_id'])
      if (!req.body[field])
        return res
          .status(400)
          .json({ error: `Missing '${field}' in request body` });

    //prevent user from posting a category to a group they are not a part of
    const member_id = req.user.id;
    const groupMembership = await TasksService.checkGroupMembership(
      req.app.get('db'),
      group_id,
      member_id,
    );
    if (!groupMembership.length) {
      return res.status(400).json({ error: `Not a valid request` });
    }

    const newCategoryInfo = { category_name, group_id };
    try {
      const newCategory = await TaskCategoriesService.postNewCategory(
        req.app.get('db'),
        newCategoryInfo,
      );
      res.status(201).json(categoryFormat(newCategory));
    } catch (error) {
      next(error);
    }
  },
);

taskCategoriesRouter.get(
  '/group/:group_id',
  requireAuth,
  async (req, res, next) => {
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
  },
);

taskCategoriesRouter
  .route('/:category_id')
  .all(requireAuth)
  .all(checkCategoryExists)
  .all(checkUserGroup)
  .get(async (req, res, next) => {
    res.status(200).json(categoryFormat(res.category));
  })
  .patch(jsonParser, async (req, res, next) => {
    const { category_id } = req.params;
    const { category_name } = req.body;

    if (!category_name) {
      return res
        .status(400)
        .json({ error: `Request must include new category name` });
    }
    try {
      let updateInfo = { category_name };

      const updatedCategory = await TaskCategoriesService.updateCategory(
        req.app.get('db'),
        category_id,
        updateInfo,
      );
      res.status(200).json(categoryFormat(updatedCategory));
    } catch (error) {
      next(error);
    }
  })
  .delete(async (req, res, next) => {
    const { category_id } = req.params;

    try {
      const deletedCategory = await TaskCategoriesService.deleteCategory(
        req.app.get('db'),
        category_id,
      );
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

async function checkCategoryExists(req, res, next) {
  try {
    const category = await TaskCategoriesService.getCategoryById(
      req.app.get('db'),
      req.params.category_id,
    );
    if (!category)
      return res.status(404).json({ error: "Category doesn't exist" });

    res.category = category;
    next();
  } catch (error) {
    next(error);
  }
}

async function checkUserGroup(req, res, next) {
  try {
    const groupMembership = await TasksService.checkGroupMembership(
      req.app.get('db'),
      res.category.group_id,
      req.user.id,
    );
    if (!groupMembership.length) {
      return res.status(400).json({
        error: `Unauthorized request: User isn't a member of the group the category belongs to`,
      });
    }
    next();
  } catch (error) {
    next(error);
  }
}
module.exports = taskCategoriesRouter;
