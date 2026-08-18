import nodemailer from 'nodemailer';

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

export async function sendEmail({ to, subject, html, text }) {
  const mailer = getTransporter();

  if (!mailer) {
    console.warn(`Email not configured. Would send to ${to}: ${subject}`);
    if (process.env.NODE_ENV !== 'production') {
      console.warn(text || html);
    }
    return { skipped: true };
  }

  await mailer.sendMail({
    from: process.env.EMAIL_FROM || 'StatNexus <noreply@statnexus.app>',
    to,
    subject,
    html,
    text,
  });

  return { sent: true };
}

export function appUrl(path) {
  const base = process.env.APP_URL || 'http://localhost:5173';
  return `${base.replace(/\/$/, '')}${path}`;
}
