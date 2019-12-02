const express = require('express');
const path = require('path');
const xss = require('xss');
const GroupsService = require('./groups-service');
const GroupsMembersService = require('../groupsmembers/groupsmembers-service');

const groupsRouter = express.Router();
const jsonParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');

const groupFormat = group => ({
  id: group.id,
  name: xss(group.name),
  owner_id: group.owner_id,
});

groupsRouter.post('/', requireAuth, jsonParser, async (req, res, next) => {
  const { name } = req.body;

  for (const field of ['name'])
    if (!req.body[field])
      return res.status(400).json({
        error: `Missing '${field}' in request body`,
      });

  const owner_id = req.user.id;
  const newGroupInfo = { name, owner_id };

  try {
    const newGroup = await GroupsService.postNewGroup(
      req.app.get('db'),
      newGroupInfo,
    );

    const groupLink = await GroupsMembersService.addGroupMember(
      req.app.get('db'),
      newGroup.id,
      newGroup.owner_id,
    );

    res
      .status(201)
      .location(path.posix.join(req.originalUrl, `/${newGroup.id}`))
      .json(groupFormat(newGroup));
  } catch (error) {
    next(error);
  }
});

groupsRouter
  .route('/:group_id')
  .all(requireAuth)
  .all(checkGroupExists)
  .get(async (req, res, next) => {
    if (res.group.owner_id != req.user.id)
      return res.status(401).json({
        error:
          'Unauthorized request. A group can only be retrieved by a member of the group',
      });
    res.status(200).json(res.group);
  })
  .delete(async (req, res, next) => {
    const group_id = res.group.id;
    if (res.group.owner_id != req.user.id)
      return res.status(401).json({
        error: 'Unauthorized request. A group can only be deleted by its owner',
      });

    try {
      const deletedGroup = await GroupsService.deleteGroup(
        req.app.get('db'),
        group_id,
      );
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

async function checkGroupExists(req, res, next) {
  try {
    const group = await GroupsService.getGroupById(
      req.app.get('db'),
      req.params.group_id,
    );
    if (!group)
      return res.status(404).json({
        error: "Group doesn't exist",
      });

    res.group = group;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = groupsRouter;
