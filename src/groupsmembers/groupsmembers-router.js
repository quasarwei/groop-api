const express = require('express');
const path = require('path');
const xss = require('xss');
const GroupsMembersService = require('./groupsmembers-service.js');

const groupsMembersRouter = express.Router();
const jsonParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');

groupsMembersRouter
  .route('/')
  .all(requireAuth)
  // get all groups a user is a member of
  .get(async (req, res, next) => {
    try {
      const userGroups = await GroupsMembersService.getUserGroups(
        req.app.get('db'),
        req.user.id,
      );
      res.status(200).json(userGroups);
    } catch (error) {
      next(error);
    }
  })
  // add a member to a group
  // todo: check if user is already in the group
  .post(jsonParser, async (req, res, next) => {
    const { group_id, member_id } = req.body;

    for (const field of ['group_id', 'member_id'])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`,
        });

    try {
      const newGroupMember = await GroupsMembersService.addGroupMember(
        req.app.get('db'),
        group_id,
        member_id,
      );

      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${newGroupMember.id}`))
        .json(newGroupMember);
    } catch (error) {
      next(error);
    }
  });

// get all members in a group
groupsMembersRouter.get('/:group_id', requireAuth, async (req, res, next) => {
  const { group_id } = req.params;
  try {
    const groupMembers = await GroupsMembersService.getGroupMembers(
      req.app.get('db'),
      group_id,
    );

    res.status(200).json(groupMembers);
  } catch (error) {
    next(error);
  }
});

// delete a member from a group
groupsMembersRouter.delete(
  '/:group_id/:member_id',
  requireAuth,
  async (req, res, next) => {
    const { group_id, member_id } = req.params;

    try {
      const deletedMember = await GroupsMembersService.deleteGroupMember(
        req.app.get('db'),
        group_id,
        member_id,
      );
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },
);

module.exports = groupsMembersRouter;
