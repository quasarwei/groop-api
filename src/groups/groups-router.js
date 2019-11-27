const express = require('express');
const xss = require('xss');


const groupFormat = group => ({
    id: group.id,
    name: xss(group.name),
    owner_id: group.owner_id
});

groupsRouter.post(':/group', jsonParser, async (req, res, next)=> {
    const { name, owner_id } = req.body;
})