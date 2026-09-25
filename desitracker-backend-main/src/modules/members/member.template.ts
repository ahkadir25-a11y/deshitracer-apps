import { emailShell, esc } from '../../utils/lib/emailShell';

// Sent when someone finishes member registration and gave us an email.
//
// Until now a member signed up and heard nothing at all — no confirmation the
// account exists, and no record anywhere outside the app of the membership
// number they will be asked for at a counter. This carries both.
export const getMemberWelcomeTemplate = (
  subject: string,
  name: string,
  serialNumber: number | string,
) =>
  emailShell(
    subject,
    `        <p>Hello <strong>${esc(name)}</strong>,</p>
        <p>
          Welcome to <strong>Desi Tracker</strong>. Your membership is active.
        </p>
        <div class="card">
          Your membership number is <strong>${esc(serialNumber)}</strong>.
        </div>
        <p>
          Show your member QR code in the app when you order, and taking part
          businesses will apply whatever member offer they are running that day.
        </p>
        <p>
          Keep this email — if you ever lose access to your account, your
          membership number helps us find you.
        </p>
        <p>Best regards,<br/>Desi Tracker Team</p>`,
  );
