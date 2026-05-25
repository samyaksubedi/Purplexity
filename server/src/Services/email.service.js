import { envVariables } from '../Configs/env.config.js';
import { sendEmail } from '../UTILS/EMAIL/email.util.js';

// ─── Shared Styles & Layout ───────────────────────────────────────────────────

const getEmailShell = ({
  name,
  verificationUrl,
  headline,
  introParagraph,
}) => ({
  html: `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Purplexity AI</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f4f7; }
          .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #6c3fc5, #9b59b6); padding: 40px 30px; text-align: center; }
          .header h1 { color: #ffffff; font-size: 28px; letter-spacing: 1px; }
          .header p { color: #e0d4f7; font-size: 14px; margin-top: 6px; }
          .body { padding: 36px 40px; color: #333333; }
          .body h2 { font-size: 22px; margin-bottom: 14px; color: #1a1a2e; }
          .body p { font-size: 15px; line-height: 1.7; color: #555555; margin-bottom: 16px; }
          .verify-box { background: #f9f6ff; border: 1px solid #e0d4f7; border-radius: 10px; padding: 24px; text-align: center; margin: 24px 0; }
          .verify-box p { font-size: 14px; color: #777; margin-bottom: 16px; }
          .cta-btn { display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #6c3fc5, #9b59b6); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; }
          .expiry-note { font-size: 12px; color: #aaaaaa; margin-top: 12px; }
          .fallback-link { word-break: break-all; font-size: 12px; color: #6c3fc5; }
          .divider { border: none; border-top: 1px solid #ebebeb; margin: 24px 0; }
          .footer { background: #f9f6ff; padding: 24px 40px; text-align: center; }
          .footer p { font-size: 12px; color: #999999; line-height: 1.6; }
          .footer a { color: #6c3fc5; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="wrapper">

          <div class="header">
            <h1>Purplexity AI</h1>
            <p>Intelligent. Powerful. Built for you.</p>
          </div>

          <div class="body">
            <h2>${headline}</h2>
            <p>${introParagraph}</p>

            <div class="verify-box">
              <p>Click the button below to confirm your email. This link expires in <strong>24 hours</strong>.</p>
              <a href="${verificationUrl}" class="cta-btn">Verify My Email →</a>
              <p class="expiry-note">
                Button not working? Copy and paste this link into your browser:<br/>
                <a href="${verificationUrl}" class="fallback-link">${verificationUrl}</a>
              </p>
            </div>

            <hr class="divider" />

            <p>
              If you didn't create an account with us, you can safely ignore this email.
              For any questions, reach out at
              <a href="mailto:${envVariables.GMAIL_USER}" style="color:#6c3fc5;">${envVariables.GMAIL_USER}</a>.
            </p>
            <p>See you on the other side,<br/><strong>The Purplexity AI Team</strong></p>
          </div>

          <div class="footer">
            <p>
              You're receiving this because you signed up at Purplexity AI.<br/>
              <a href="${envVariables.CLIENT_URL}/privacy">Privacy Policy</a>
            </p>
          </div>

        </div>
      </body>
    </html>
  `,
  text: `Hey ${name}, ${introParagraph} ${verificationUrl} — This link expires in 24 hours.`,
});

// ─── Email Functions ──────────────────────────────────────────────────────────

const sendWelcomeEmail = async ({ to, name, verificationToken }) => {
  //! Temp for development
  const verificationUrl = `${envVariables.CLIENT_URL}/verify/${verificationToken}`;
  // const verificationUrl = `${envVariables.CLIENT_URL}/verify/${verificationToken}`;

  const { html, text } = getEmailShell({
    name,
    verificationUrl,
    headline: `Hey ${name}, welcome aboard! 👋`,
    introParagraph: `We're thrilled to have you join Purplexity AI. One last step — please verify your email address to activate your account.`,
  });

  return sendEmail({
    to,
    subject: 'Welcome to Purplexity AI — Please Verify Your Email',
    html,
    text,
  });
};

const sendResendVerificationEmail = async ({ to, name, verificationToken }) => {
  //! Temp for development
  // const verificationUrl = `${envVariables.CLIENT_URL}/api/auth/verify/${verificationToken}`;
  const verificationUrl = `${envVariables.CLIENT_URL}/verify/${verificationToken}`;

  const { html, text } = getEmailShell({
    name,
    verificationUrl,
    headline: `Hey ${name}, here's your new verification link`,
    introParagraph: `You requested a new verification email. Use the link below to verify your account.`,
  });

  return sendEmail({
    to,
    subject: 'Purplexity AI — New Verification Link',
    html,
    text,
  });
};

export { sendWelcomeEmail, sendResendVerificationEmail };
