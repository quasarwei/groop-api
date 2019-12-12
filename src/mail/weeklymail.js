const express = require('express');
const knex = require('knex');

const { DATABASE_URL } = require('../config');
const { transporter, sendMail } = require('../mail-service');

const GroupsMembersService = require('../groupsmembers/groupsmembers-service');
const GroupsService = require('../groups/groups-service');
const UsersService = require('../users/users-service');
const TasksService = require('../tasks/tasks-service');

const db = knex({
  client: 'pg',
  connection: DATABASE_URL,
});

sendWeeklyMail = async () => {
  const emailList = await UsersService.getUsersWithNotifications(db);
  const taskList = await Promise.all(
    emailList.map(async user => {
      let taskListItems = '';
      const tasks = await TasksService.getTasksWithinWeek(db, user.id);

      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const group = await GroupsService.getGroupById(db, task.group_id);
        const groupname = group.name;
        taskListItems += `
        <li style="margin: 16px; padding-bottom: 1.5em; border-bottom: 1px solid #95a5a5;">
          <div>
            <h4>${task.name}</h4>
            <p style="margin: 0 16px;">Description: ${task.description}</p>
            <p style="margin: 0 16px;">Date Due: ${new Date(
              task.date_due,
            ).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
            })}</p>
            <p style="margin: 0 16px;">Priority: ${
              task.priority === 1
                ? 'low'
                : task.priority === 2
                ? 'medium'
                : 'high'
            }</p>
            <p style="margin: 0 16px;">Group: ${groupname}</p>
          </div>
        </li>
        `;
      }
      return taskListItems;
    }),
  );

  let allMailOptions = emailList.map((user, i) => {
    return {
      from: '"13 Minutes" <groopnotify@gmail.com>',
      to: user.email,
      subject: `Your weekly glance`,
      // prettier-ignore
      html: `
      <section style="margin: 0 auto; background-color: #95a5a5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 2rem; text-align: center; background-color: #363432; color: #fafafa; ">
          <h2>Groop</h2>
          <div style="height: 0; width: 200px; margin: 0 auto; border: 1px solid #4a9afa;"></div>
          <h1>Your upcoming tasks for the week</h1>
          <div style="text-align: left; padding: 1em;">
            <h3>Hello ${user.username}, these are your next upcoming tasks this week</h3>
            <ul style="list-style: none; padding: 0;">
             ${taskList[i]} 
            </ul>
          </div>
        </div>
      </section>`
    };
  });
  allMailOptions.forEach(async mailOption => {
    return sendMail(mailOption, transporter);
  });
};
module.exports = sendWeeklyMail;
