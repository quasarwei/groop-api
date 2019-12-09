const express = require('express');
const path = require('path');
const xss = require('xss');

const groupsMembersRouter = express.Router();
const jsonParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');
const { transporter, sendMail } = require('../mail-service');
const UsersService = require('../users/users-service');
const GroupsService = require('../groups/groups-service');
const GroupsMembersService = require('./groupsmembers-service.js');

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
  .post(jsonParser, async (req, res, next) => {
    const { group_id, username } = req.body;

    for (const field of ['group_id', 'username'])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`,
        });

    const newMember = await UsersService.getUserByUsername(
      req.app.get('db'),
      username,
    );
    if (!newMember) {
      return res.status(400).json({
        error: `User doesn't exist`,
      });
    }

    const oldGroupMembers = await GroupsMembersService.getGroupMembers(
      req.app.get('db'),
      group_id,
    );

    oldGroupMembers.forEach(member => {
      if (member.username === username)
        return res
          .status(400)
          .json({ error: `user ${username} is already a member of the group` });
    });

    try {
      const newGroupMember = await GroupsMembersService.addGroupMember(
        req.app.get('db'),
        group_id,
        newMember.id,
        username,
      );

      const group = await GroupsService.getGroupById(
        req.app.get('db'),
        group_id,
      );

      let mailOption = {
        from: '"13 Minutes" <groopnotify@gmail.com>',
        to: newMember.email,
        subject: `You've been added to a new group`,
        html: `
        <section style="margin: 0 auto; background-color: #95a5a5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 2rem; text-align: center; background-color: #363432; color: #fafafa; ">
            <h2>Groop</h2>
            <div style="height: 0; width: 200px; margin: 0 auto; border: 1px solid #4a9afa;"></div>
            <h1>You've been added to the group <i>${group.name}</i></h1>
            <div style="text-align: left;">
            </div>
          </div>
        </section>`,
      };

      if (newMember.notifications) sendMail(mailOption, transporter);

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

      const deletedMemberInfo = await UsersService.getUser(
        req.app.get('db'),
        member_id,
      );

      const group = await GroupsService.getGroupById(
        req.app.get('db'),
        group_id,
      );

      let mailOption = {
        from: '"13 Minutes" <groopnotify@gmail.com>',
        to: deletedMemberInfo.email,
        subject: `You've been removed from a group`,
        html: `
        <section style="margin: 0 auto; background-color: #95a5a5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 2rem; text-align: center; background-color: #363432; color: #fafafa; ">
            <h2>Groop</h2>
            <div style="height: 0; width: 200px; margin: 0 auto; border: 1px solid #4a9afa;"></div>
            <h1>You've been removed from the group <i>${group.name}</i></h1>
            <div style="text-align: left;">
            </div>
          </div>
        </section>`,
      };
      if (deletedMemberInfo.notifications) sendMail(mailOption, transporter);

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },
);

module.exports = groupsMembersRouter;
