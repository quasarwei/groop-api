const nodemailer = require('nodemailer');
const { MAIL_PSWD } = require('./config');

// create reusable transporter obejct using the default SMTP transport
let transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
    user: 'groopnotify@gmail.com',
    pass: MAIL_PSWD,
  },
});

module.exports = { transporter };
