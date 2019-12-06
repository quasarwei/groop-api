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

sendMail = async (mailOption, transport) => {
  const info = await transport.sendMail(mailOption, function(error, info) {
    if (error) return false;
    else {
      console.log('Message sent: ' + info.response);
      return true;
    }
  });
};

module.exports = { transporter, sendMail };
