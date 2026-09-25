import { emailShell, esc } from '../../utils/lib/emailShell';

export const getRegistrationReceivedTemplate = (
  subject: string,
  businessName: string,
) => {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>${subject}</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
        background-color: #f6f6f6;
      }
      .container {
        max-width: 600px;
        margin: 30px auto;
        background-color: #ffffff;
        border-radius: 6px;
        box-shadow: 0 0 10px rgba(0,0,0,0.05);
        padding: 30px;
      }
      .header {
        text-align: center;
        padding-bottom: 20px;
        border-bottom: 1px solid #e6e6e6;
      }
      .header h1 {
        color: #333333;
      }
      .content {
        padding: 20px 0;
        font-size: 16px;
        color: #555555;
        line-height: 1.6;
      }
      .footer {
        margin-top: 30px;
        font-size: 14px;
        text-align: center;
        color: #999999;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Desi Tracker</h1>
      </div>
      <div class="content">
        <p>Dear <strong>${businessName}</strong>,</p>
        <p>
          Thank you for registering your business with <strong>Desi Tracker</strong>.
          Our team will review your submission within <strong>24 hours</strong>.
        </p>
        <p>
          Once approved, your listing will be published and accessible to users.
        </p>
        <p>
          Should we require any further details, we will contact you directly.
        </p>
        <p>
          We appreciate your interest in joining the <strong>Desi Tracker</strong> network.
        </p>
      </div>
      <div class="footer">
        &copy; 2025 Desi Tracker. All rights reserved.
      </div>
    </div>
  </body>
</html>`;
};

export const getBusinessApprovedTemplate = (
  subject: string,
  businessName: string,
) => {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>${subject}</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
        background-color: #f6f6f6;
      }
      .container {
        max-width: 600px;
        margin: 30px auto;
        background-color: #ffffff;
        border-radius: 6px;
        box-shadow: 0 0 10px rgba(0,0,0,0.05);
        padding: 30px;
      }
      .header {
        text-align: center;
        padding-bottom: 20px;
        border-bottom: 1px solid #e6e6e6;
      }
      .header h1 {
        color: #333333;
      }
      .content {
        padding: 20px 0;
        font-size: 16px;
        color: #555555;
        line-height: 1.6;
      }
      .footer {
        margin-top: 30px;
        font-size: 14px;
        text-align: center;
        color: #999999;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Desi Tracker</h1>
      </div>
      <div class="content">
        <p>Dear <strong>${businessName}</strong>,</p>
        <p>
          We are pleased to inform you that your business listing has been successfully reviewed and approved on <strong>Desi Tracker</strong>.
        </p>
        <p>
          Your profile is now live and visible to users across our platform.
        </p>
        <p>
          You can update your information or add promotions anytime through your dashboard.
        </p>
        <p>
          Thank you for joining the <strong>Desi Tracker</strong> community – we’re excited to support your growth.
        </p>
        <p>Best regards,<br/>Desi Tracker Team</p>
      </div>
      <div class="footer">
        &copy; 2025 Desi Tracker. All rights reserved.
      </div>
    </div>
  </body>
</html>`;
};

// Sent the moment a business is registered.
//
// Not to be confused with getBusinessApprovedTemplate above: nothing is
// reviewed or approved today — a listing goes live on save — so telling the
// owner their listing was "approved", or that a team will look at it within 24
// hours, describes a process that does not exist. This one says what actually
// happened and what to do next.
export const getBusinessWelcomeTemplate = (
  subject: string,
  businessName: string,
  ownerName?: string,
) => {
  const greeting = ownerName ? esc(ownerName) : esc(businessName);
  return emailShell(
    subject,
    `        <p>Hello <strong>${greeting}</strong>,</p>
        <p>
          Welcome to <strong>Desi Tracker</strong>. <strong>${esc(businessName)}</strong> is
          registered and your listing is live — customers can find you in the app from now.
        </p>
        <div class="card">
          A good next step is to add your opening hours, a photo and your menu or
          services. Listings with those filled in get found far more often.
        </div>
        <p>
          You can change anything at any time from your dashboard in the app.
        </p>
        <p>Best regards,<br/>Desi Tracker Team</p>`,
  );
};
