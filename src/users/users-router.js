/* eslint-disable strict */
const express = require('express');
const path = require('path');
const UsersService = require('./users-service');
const nodemailer = require('nodemailer');

const { MAIL_PSWD } = require('../config');

const usersRouter = express.Router();
const jsonBodyParser = express.json();

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

    // create reusable transporter obejct using the default SMTP transport
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      auth: {
        user: 'groopnotify@gmail.com',
        pass: MAIL_PSWD,
      },
    });

    // prettier-ignore
    let mailOptions = {
    from: '"13 Minutes" <groopnotify@gmail.com>',             // sender address
    to: email,                                                // list of receivers
    subject: 'Welcome to Groop - Registration Confirmation ', // subject line
    text: 'Thank you for signing up for Groop',               // plain text body
    html:
      '<h1>Thank you for signing up for Groop</h1><p>With your new account, you can now opt to receive email reminders for tasks created on the Groop website</p><p>13 Minutes</p>',
  };

    const hashedPassword = await UsersService.hashPassword(password);
    const newUser = {
      username,
      password: hashedPassword,
      fullname,
      email,
    };
    const user = await UsersService.insertUser(req.app.get('db'), newUser);

    // send confirmation email
    let info = await transporter.sendMail(mailOptions, function(error, info) {
      if (error) return false;
      else {
        console.log('Message sent: ' + info.response);
        return true;
      }
    });

    res
      .status(201)
      .location(path.posix.join(req.originalUrl, `/${user.id}`))
      .json(UsersService.serializeUser(user));
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;
