/* eslint-disable strict */
const bcrypt = require('bcryptjs');
const xss = require('xss');

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;
const REGEX_EMAIL = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const UsersService = {
  hasUserWithUserName(db, username) {
    return db('groop_users')
      .where({ username })
      .first()
      .then(user => !!user);
  },
  hasUserWithEmail(db, email) {
    return db('groop_users')
      .where({ email })
      .first()
      .then(user => !!user);
  },
  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into('groop_users')
      .returning('*')
      .then(([user]) => user);
  },
  updateUser(db, id, updatedInfo) {
    return db('groop_users')
      .where({ id })
      .update(updatedInfo)
      .returning('*')
      .then(rows => rows[0]);
  },
  getUser(db, id) {
    return db('groop_users')
      .select('id', 'username', 'fullname', 'email', 'notifications')
      .where({ id })
      .first();
  },
  validatePassword(password) {
    if (password.length < 8) {
      return 'Password must be longer than 8 characters';
    }
    if (password.length > 72) {
      return 'Password must be less than 72 characters';
    }
    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password must not start or end with empty spaces';
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return 'Password must contain one upper case, lower case, number and special character';
    }
    return null;
  },
  validateEmail(email) {
    if (!REGEX_EMAIL.test(email)) {
      return 'Email is invalid';
    }
    return null;
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
  serializeUser(user) {
    return {
      id: user.id,
      fullname: xss(user.fullname),
      username: xss(user.username),
      email: xss(user.email),
      notifications: user.notifications,
    };
  },
};

module.exports = UsersService;
