/* eslint-disable strict */
const express = require('express');
const path = require('path');
const UsersService = require('./users-service');

const usersRouter = express.Router();
const jsonBodyParser = express.json();

usersRouter.post('/', jsonBodyParser, (req, res, next) => {
  const { password, username, fullname, email } = req.body;

  for (const field of ['fullname', 'username', 'password', 'email'])
    if (!req.body[field])
      return res.status(400).json({
        error: `Missing '${field}' in request body`,
      });

  // validate password strength
  const passwordError = UsersService.validatePassword(password);
  if (passwordError) return res.status(400).json({ error: passwordError });

  // validate email
  const emailError = UsersService.validateEmail(email);
  if (emailError) return res.status(400).json({ error: emailError });

  let userExists;
  // validate user doesn't already exist
  UsersService.hasUserWithUserName(req.app.get('db'), username)
    .then(hasUserWithUserName => {
      if (hasUserWithUserName) {
        userExists = true;
        return res.status(400).json({ error: `Username already taken` });
      }
    })
    .catch(next);

  // validate email not already being used
  UsersService.hasUserWithEmail(req.app.get('db'), email)
    .then(hasUserWithEmail => {
      if (hasUserWithEmail) {
        userExists = true;
        return res.status(400).json({ error: 'Email is already being used' });
      }
    })
    .catch(next);

  if (!userExists) {
    return UsersService.hashPassword(password)
      .then(hashedPassword => {
        const newUser = {
          username,
          password: hashedPassword,
          fullname,
          email,
        };

        // insert new user info into table
        // send user.id in header location
        return UsersService.insertUser(req.app.get('db'), newUser).then(
          user => {
            res
              .status(201)
              .location(path.posix.join(req.originalUrl, `/${user.id}`))
              .json(UsersService.serializeUser(user));
          },
        );
      })
      .catch(next);
  }
});

module.exports = usersRouter;
