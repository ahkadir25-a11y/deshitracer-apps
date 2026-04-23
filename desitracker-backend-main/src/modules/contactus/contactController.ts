import { Request, Response } from 'express';
import { sendContactEmail } from './contactService';
import { Contact } from './contactInterface';

// Controller to handle the contact form submission
export const sendContactMessage = async (req: Request, res: Response): Promise<void> => {
  const { name, email, message, phone }: Contact = req.body;

  // Validate input
  if (!name || !email || !message || !phone) {
    res.status(400).json({ error: 'Please provide all fields: name, email, message' });
    return;
  }

  const contactMessage: Contact = { name, email, message, phone };

  // Call the service to send the email
  const emailSent = await sendContactEmail(contactMessage);

  if (emailSent) {
    res.status(200).json({ message: 'Message sent successfully' });
  } else {
    res.status(500).json({ error: 'There was an error sending the email' });
  }
};
