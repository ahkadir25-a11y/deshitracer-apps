import nodeMailer from 'nodemailer';
import config from '../../config';

const sendEmail = async (options: any) => {
  const transporter = nodeMailer.createTransport({
    host: config.smptHost,
    port: config.smptPort,
    secure: true,
    auth: {
      user: config.nodemailerUser,
      pass: config.nodemailerPass,
    },
    debug: true, // Add this
    logger: true // And this
  } as nodeMailer.TransportOptions);
  // Verify the connection configuration
  await transporter.verify();

  const mailOptions = {
    from: config.nodemailerUser,
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

    // // Logging the message ID from the result
    // console.log(`Email sent successfully! Message ID: ${JSON.stringify(result)}`);

    // // Return the message ID or other relevant details
    return result?.messageId;
  } catch (error: any) {
    console.error(`Failed to send email: ${error?.message}`);
    throw new Error('Failed to send email');
  }
};

export default sendEmail;
