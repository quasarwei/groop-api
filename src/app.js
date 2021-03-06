require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');

const authRouter = require('./auth/auth-router');
const usersRouter = require('./users/users-router');
const groupsRouter = require('./groups/groups-router');
const groupsMembersRouter = require('./groupsmembers/groupsmembers-router');
const tasksRouter = require('./tasks/tasks-router');
const taskCategoriesRouter = require('./tasks/task-categories-router');

let CronJob = require('cron').CronJob;
const sendWeeklyMail = require('./mail/weeklymail');

const app = express();

const morganOption =
  (NODE_ENV === 'production' ? 'tiny' : 'common',
  {
    skip: () => NODE_ENV === 'test',
  });

app.use(morgan('combined', morganOption));
app.use(helmet());
app.use(cors());

app.get('/', (req, res, next) => {
  console.log('welcome');
  res.status(200).send('Hello, groups!');
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/groupsmembers', groupsMembersRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/categories', taskCategoriesRouter);

new CronJob('0 12 * * Sun', sendWeeklyMail, null, true, 'America/Los_Angeles');

app.use(function errorHandler(error, req, res, next) {
  //eslint-disable-line no-unused-vars
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
