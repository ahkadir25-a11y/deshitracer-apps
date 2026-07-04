import nodeMailer from 'nodemailer';
import config from '../../config';

// Create the transporter once at startup to reuse connections
const transporter = nodeMailer.createTransport({
  host: config.smptHost,
  port: Number(config.smptPort),
  secure: Number(config.smptPort) === 465, // true for 465, false for other ports (like 587)
  auth: {
    user: config.nodemailerUser,
    pass: config.nodemailerPass,
  },
  // debug: true, // Only enable if needed
  // logger: true 
} as nodeMailer.TransportOptions);

const sendEmail = async (options: any) => {
  // Show the business name as the sender's display name when provided, so a
  // recipient sees e.g. "Rech Tech" instead of the generic mailbox. SMTP only
  // allows our one authenticated address, but the display name is free-form.
  // Falls back to the company name, then the raw mailbox.
  const senderName = options.fromName || config.companyName || 'Deshi Tracker';
  const fromAddress = config.nodemailerUser;
  const from = `"${String(senderName).replace(/"/g, '')}" <${fromAddress}>`;

  const mailOptions = {
    from,
    to: options.email,
    subject: options.subject,
    html: options.message,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'X-Mailer': 'Deshi Tracker Mailer',
      'Content-Language': 'en',
    },
  };

  try {
    // Sending the email and capturing the result
    const result = await transporter.sendMail(mailOptions);
    return result?.messageId;
  } catch (error: any) {
    console.error(`Failed to send email to ${options.email}: ${error?.message}`);
    throw new Error(`Failed to send email: ${error?.message || error}`);
  }
};

export default sendEmail;
