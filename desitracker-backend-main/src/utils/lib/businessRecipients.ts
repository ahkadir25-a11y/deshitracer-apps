import { Business } from '../../modules/business/business.model';
import { User } from '../../modules/user/user/user.model';
import { RotaEmployee } from '../../modules/rota/employee/employee.model';

export interface BusinessRecipients {
  // Display name used as the email "from" name and inside templates.
  businessName: string;
  // Deduped, lowercased, valid-looking email addresses to notify.
  recipients: string[];
  // The owner's email-alert preferences, with defaults applied (missing = on).
  notify: {
    emailOnNewOrder: boolean;
    emailOnNewReservation: boolean;
  };
}

const isEmail = (s: any): boolean =>
  typeof s === 'string' && /\S+@\S+\.\S+/.test(s.trim());

/**
 * Resolve the people at a business who should receive a notification email.
 *
 * By default this is "the business owner": the owner's User.email plus the
 * business's registered contact email. Pass `{ includeStaff: true }` to also
 * include every ACTIVE staff member — use that only for low-frequency events
 * (e.g. reservations), not for every order, to avoid flooding staff inboxes.
 *
 * Always returns a result; on any lookup failure it returns whatever it could
 * resolve (possibly an empty recipient list) so callers can stay best-effort.
 */
export const resolveBusinessRecipients = async (
  businessId: string,
  opts: { includeStaff?: boolean } = {},
): Promise<BusinessRecipients> => {
  const out = new Set<string>();
  let businessName = 'your business';
  // Default both alerts ON — a business with no saved preference still gets
  // notified, and we only suppress when the owner explicitly turned it off.
  const notify = { emailOnNewOrder: true, emailOnNewReservation: true };

  try {
    const business = await Business.findById(businessId)
      .select('businessName owner contactDetails.email notificationSettings')
      .lean();

    if (business) {
      businessName = (business as any).businessName || businessName;

      const ns = (business as any).notificationSettings;
      if (ns) {
        notify.emailOnNewOrder = ns.emailOnNewOrder !== false;
        notify.emailOnNewReservation = ns.emailOnNewReservation !== false;
      }

      const contactEmail = (business as any)?.contactDetails?.email;
      if (isEmail(contactEmail)) out.add(String(contactEmail).trim().toLowerCase());

      const ownerId = (business as any).owner;
      if (ownerId) {
        const owner = await User.findById(ownerId).select('email').lean();
        const ownerEmail = (owner as any)?.email;
        if (isEmail(ownerEmail)) out.add(String(ownerEmail).trim().toLowerCase());
      }
    }

    if (opts.includeStaff) {
      const staff = await RotaEmployee.find({
        business: businessId,
        status: 'ACTIVE',
        isDeleted: false,
      })
        .select('email')
        .lean();
      staff.forEach((s: any) => {
        if (isEmail(s?.email)) out.add(String(s.email).trim().toLowerCase());
      });
    }
  } catch (err: any) {
    console.error('[recipients] resolve failed:', err?.message);
  }

  return { businessName, recipients: Array.from(out), notify };
};

export default resolveBusinessRecipients;
