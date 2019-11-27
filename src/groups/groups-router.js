const express = require('express');
const xss = require('xss');
const GroupService = require('./groups-service');

const groupFormat = group => ({
    id: group.id,
    name: xss(group.name),
    owner_id: group.owner_id
});

groupsRouter.post(':/groups', jsonParser, async (req, res, next)=> {
    const { name, owner_id } = req.body;

    for (const field of ['name', 'owner_id'])
    if (!req.body[field])
    return res.status(400).json({
        error: `Missing '${field}' in request body`,
    });

    const newGroupInfo = {name, owner_id};
    try {
        const newGroup = await GroupService.postNewGroup(req.app.get('db'), newGroupInfo);
        res.status(201)
        .location(path.posix.join(req.originUrl, `/${newGroup.id}`))
        .json(groupFormat(newGroup));
    }
    catch (error) {
        next(error);
    }
})

module.exports = groupsRouter;