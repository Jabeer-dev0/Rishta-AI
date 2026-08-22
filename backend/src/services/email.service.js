const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_email@gmail.com') {
    console.log(`[EmailService DEV] Would send email to: ${to}\nSubject: ${subject}`);
    return { success: true, dev: true };
  }
  try {
    const from = process.env.EMAIL_FROM || `"Rishtaai 💍" <${process.env.SMTP_USER}>`;
    console.log(`[EmailService] Sending email to ${to} from ${from}...`);

    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
    console.log(`[EmailService] Email sent! MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[EmailService] Error:', err.message);
    return { success: false, error: err.message };
  }
};

const sendWelcomeEmail = (user) => sendEmail({
  to: user.email,
  subject: '💍 Welcome to Rishtaai — Your Journey Begins!',
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#D70040">Welcome to Rishtaai, ${user.name}!</h2>
      <p>Your profile has been created successfully. Complete your profile to get better matches.</p>
      <p style="color:#666">Next steps:<br>
        ✅ Verify your face with profile photo<br>
        🧠 Take the personality test<br>
        📱 Connect social media (optional)<br>
      </p>
      <a href="${process.env.FRONTEND_URL}/app" style="background:#D70040;color:white;padding:12px 24px;border-radius:8px;text-decoration:none">Go to Dashboard</a>
      <p style="margin-top:24px;color:#999;font-size:12px">Rishtaai — Where tradition meets technology.</p>
    </div>`,
});

const sendPasswordResetEmail = (user, resetUrl) => sendEmail({
  to: user.email,
  subject: '🔐 Reset Your Rishtaai Password',
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#D70040">Password Reset Request</h2>
      <p>Hi ${user.name}, you requested a password reset. Click below to reset it:</p>
      <a href="${resetUrl}" style="background:#D70040;color:white;padding:12px 24px;border-radius:8px;text-decoration:none">Reset Password</a>
      <p style="color:#999;font-size:12px;margin-top:16px">This link expires in 10 minutes. If you didn't request this, ignore this email.</p>
    </div>`,
});

module.exports = { sendEmail, sendWelcomeEmail, sendPasswordResetEmail };
