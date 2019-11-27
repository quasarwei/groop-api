const express = require('express');
const path = require('path');
const xss = require('xss');
const GroupsMembersService = require('./groupsmembers-service.js');

const groupsMembersRouter = express.Router();
const jsonParser = express.json();

groupsMembersRouter.post('/', jsonParser, async (req, res, next) => {
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

module.exports = groupsMembersRouter;
