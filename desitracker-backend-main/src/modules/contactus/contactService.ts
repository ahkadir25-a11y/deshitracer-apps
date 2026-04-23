import sendEmail from '../../utils/lib/sendEmail';
import { Contact } from './contactInterface';

const ADMIN_EMAIL = 'info.desitracker@gmail.com';

// Service to send contact email
export const sendContactEmail = async (contact: Contact): Promise<boolean> => {
  const { name, email, message, phone } = contact;

  try {
    // 1️⃣ Send email to Admin
    await sendEmail({
      email: ADMIN_EMAIL,
      subject: `New Contact Us Message from ${name}`,
      message: `
        <h2>New Contact Message Received</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    // 2️⃣ Send Thank You Email to User
    await sendEmail({
      email: email,
      subject: `Thank You for Contacting Us, ${name}!`,
      message: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2C18C6;">Thank You for Reaching Out!</h2>
          <p>Hi ${name},</p>
          <p>We have received your message and our team will get back to you as soon as possible. Here's a summary of what you sent us:</p>
          <hr>
          <p><strong>Your Message:</strong></p>
          <blockquote style="border-left: 4px solid #2C18C6; padding-left: 10px; color: #555;">
            ${message.replace(/\n/g, '<br>')}
          </blockquote>
          <hr>
          <p>If you need immediate assistance, feel free to contact us at <a href="mailto:${ADMIN_EMAIL}">${ADMIN_EMAIL}</a>.</p>
          <p>Thank you for choosing DesiTracker!</p>
          <br>
          <p>Best regards,<br>The DesiTracker Team</p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
