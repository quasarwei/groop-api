const express = require('express');
const path = require('path');
const xss = require('xss');
const GroupsService = require('./groups-service');
const GroupsMembersService = require('../groupsmembers/groupsmembers-service');

groupsRouter = express.Router();
const jsonParser = express.json();

const groupFormat = group => ({
  id: group.id,
  name: xss(group.name),
  owner_id: group.owner_id,
});

groupsRouter.post('/', jsonParser, async (req, res, next) => {
  const { name, owner_id } = req.body;

  for (const field of ['name', 'owner_id'])
    if (!req.body[field])
      return res.status(400).json({
        error: `Missing '${field}' in request body`,
      });

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

groupsRouter.delete('/:group_id', async (req, res, next) => {
  const { group_id } = req.params;

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

module.exports = groupsRouter;
