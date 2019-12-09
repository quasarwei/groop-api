/* eslint-disable strict */
const express = require('express');
const path = require('path');
const UsersService = require('./users-service');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const { transporter, sendMail } = require('../mail-service');

const usersRouter = express.Router();
const jsonBodyParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');

usersRouter.post('/', jsonBodyParser, async (req, res, next) => {
  const { password, username, fullname, email } = req.body;

  for (const field of ['fullname', 'username', 'password', 'email'])
    if (!req.body[field])
      return res.status(400).json({
        error: `Missing '${field}' in request body`,
      });
  try {
    // validate password strength
    const passwordError = UsersService.validatePassword(password);
    if (passwordError) return res.status(400).json({ error: passwordError });

    // validate email
    const emailError = UsersService.validateEmail(email);
    if (emailError) return res.status(400).json({ error: emailError });

    // validate user doesn't already exist
    const hasUserWithUserName = await UsersService.hasUserWithUserName(
      req.app.get('db'),
      username,
    );
    if (hasUserWithUserName)
      return res.status(400).json({ error: `Username already taken` });

    // validate email not already being used
    const hasUserWithEmail = await UsersService.hasUserWithEmail(
      req.app.get('db'),
      email,
    );
    if (hasUserWithEmail)
      return res.status(400).json({ error: 'Email is already being used' });

    // prettier-ignore
    let mailOptions = {
    from: '"13 Minutes" <groopnotify@gmail.com>',             // sender address
    to: email,                                                // list of receivers
    subject: 'Welcome to Groop - Registration Confirmation ', // subject line
    text: 'Thank you for signing up for Groop',               // plain text body
    html: `
    <section style="margin: 0 auto; background-color: #95a5a5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 2rem; text-align: center; background-color: #363432; color: #fafafa; ">
        <h2>Groop</h2>
        <div style="height: 0; width: 200px; margin: 0 auto; border: 1px solid #4a9afa;"></div>
        <h1>Thank you for signing up for Groop</h1>
        <div style="text-align: left;">
          <p style="margin: 0 16px;">With your new account, you can now opt to receive email reminders for tasks created on the Groop website</p>
        </div>
      </div>
    </section>`
  };

    const hashedPassword = await UsersService.hashPassword(password);
    const newUser = {
      username,
      password: hashedPassword,
      fullname,
      email,
    };
    const user = await UsersService.insertUser(req.app.get('db'), newUser);
    sendMail(mailOptions, transporter);

    res
      .status(201)
      .location(path.posix.join(req.originalUrl, `/${user.id}`))
      .json(UsersService.serializeUser(user));
  } catch (error) {
    next(error);
  }
});

usersRouter
  .route('/')
  .all(requireAuth)
  .get(async (req, res, next) => {
    res.status(200).json(UsersService.serializeUser(req.user));
  })
  .patch(jsonBodyParser, async (req, res, next) => {
    const { fullname, password, email } = req.body;
    let notifications = req.body.notifications
      ? 'true'
      : req.body.notifications === undefined
      ? undefined
      : 'false';

    let updateInfo = {
      fullname,
      password,
      email,
      notifications,
    };

    const numOfValues = Object.values(updateInfo).filter(Boolean).length;
    if (numOfValues == 0) {
      return res.status(400).json({
        error: {
          message: `Request must include at least one item to edit: fullname, password, email, or notifications`,
        },
      });
    }

    if (email) {
      // validate email
      const emailError = UsersService.validateEmail(email);
      if (emailError) return res.status(400).json({ error: emailError });

      // validate email not already being used
      const hasUserWithEmail = await UsersService.hasUserWithEmail(
        req.app.get('db'),
        email,
      );
      if (hasUserWithEmail)
        return res.status(400).json({ error: 'Email is already being used' });
    }

    let hashedPassword;
    if (password) {
      // validate password strength
      const passwordError = UsersService.validatePassword(password);
      if (passwordError) return res.status(400).json({ error: passwordError });

      hashedPassword = await UsersService.hashPassword(password);
    }

    updateInfo = {
      ...updateInfo,
      password: hashedPassword,
      notifications: notifications === 'true' ? true : false,
    };

    try {
      const updatedUser = await UsersService.updateUser(
        req.app.get('db'),
        req.user.id,
        updateInfo,
      );

      if (updatedUser) {
        res.status(200).json(UsersService.serializeUser(updatedUser));
      }
    } catch (error) {
      next(error);
    }
  });

usersRouter
  .route('/verify')
  .all(requireAuth)
  .post(jsonBodyParser, async (req, res, next) => {
    const { password } = req.body;
    if (!password)
      return res.status(400).json({
        error: `Must enter password`,
      });
    try {
      const verified = await bcrypt.compare(password, req.user.password);
      if (!verified) {
        return res.status(400).json({
          error: `Incorrect password`,
        });
      }
      return res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

module.exports = usersRouter;
