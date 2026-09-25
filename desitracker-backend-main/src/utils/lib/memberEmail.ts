// One email = one account across the platform. Owners, staff and admins live
// in the User collection and members in the Member collection, so neither
// collection's unique index can see the other. Member signup already checks
// the User side; every path that gives an email to a User must check this side
// too, or one address ends up as both an owner and a member — and
// forgot-password (which looks at Users first) can then never reach the
// member.
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function emailBelongsToMember(email?: string | null): Promise<boolean> {
  const e = typeof email === 'string' ? email.trim() : '';
  if (!e) return false;
  // Loaded lazily to keep user/employee services out of any model import cycle.
  const { Member } = await import('../../modules/members/member.model');
  // Case-insensitive: older member rows may not have been lower-cased.
  const hit = await Member.exists({
    email: { $regex: `^${escapeRegex(e)}$`, $options: 'i' },
    deletedAt: null,
  });
  return !!hit;
}

export const MEMBER_EMAIL_TAKEN =
  'This email is already registered as a Member account. Please sign in as a member, or use a different email address.';
