// mail.config.js
import { createTransport } from 'nodemailer';
import { envVariables } from './env.config.js';

const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: envVariables.GMAIL_USER,
    pass: envVariables.GMAIL_APP_PASSWORD,
  },
});

// console.log('GMAIL_USER:', envVariables.GMAIL_USER);
// console.log('GMAIL_APP_PASS:', envVariables.GMAIL_APP_PASSWORD);

const verifyMailTransporter = () => {
  transporter.verify((error) => {
    if (error) console.error('Mail config error:', error.message);
    else console.log('Mail transporter ready ✅');
  });
};

export { transporter, verifyMailTransporter };
