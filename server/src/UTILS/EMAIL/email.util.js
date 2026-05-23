import { transporter } from '../../Configs/mail.config.js';
import { logger } from '../../Configs/logger.config.js';

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: `"Purplexity AI" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully', {
      to,
      subject,
      messageId: info.messageId,
    });
    return info;
  } catch (error) {
    logger.error('Failed to send email', {
      error: error.message,
      stack: error.stack,
      to,
      subject,
    });
    throw error; // let the caller handle it
  }
};

export { sendEmail };
