"use strict";
// Branded reservation confirmation email sent to the customer who booked.
// The business name (e.g. "Rech Tech") appears as the sender and throughout.
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingOwnerNotificationTemplate = exports.bookingConfirmationTemplate = void 0;
const formatWhen = (d) => {
    const date = new Date(d);
    if (isNaN(date.getTime()))
        return String(d);
    return date.toLocaleString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};
const esc = (s) => String(s !== null && s !== void 0 ? s : '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
const bookingConfirmationTemplate = (data) => {
    const { businessName, name, bookingDate, guests, specialRequests } = data;
    const when = formatWhen(bookingDate);
    return `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; background:#f8f9fb; padding: 24px;">
    <div style="background:#ffffff; border-radius:14px; overflow:hidden; border:1px solid #eef0f4;">
      <div style="background:#4f46e5; padding:24px 28px;">
        <h1 style="margin:0; color:#ffffff; font-size:20px;">${esc(businessName)}</h1>
        <p style="margin:6px 0 0; color:#e0e7ff; font-size:14px;">Reservation Confirmed 🎉</p>
      </div>
      <div style="padding:28px;">
        <p style="font-size:15px; color:#111827; margin:0 0 16px;">Hi ${esc(name)},</p>
        <p style="font-size:14px; color:#374151; line-height:1.6; margin:0 0 20px;">
          Your table at <strong>${esc(businessName)}</strong> is booked. Here are your details:
        </p>
        <table style="width:100%; border-collapse:collapse; font-size:14px; color:#111827;">
          <tr>
            <td style="padding:10px 0; color:#6b7280;">When</td>
            <td style="padding:10px 0; text-align:right; font-weight:bold;">${esc(when)}</td>
          </tr>
          <tr style="border-top:1px solid #f0f0f0;">
            <td style="padding:10px 0; color:#6b7280;">Guests</td>
            <td style="padding:10px 0; text-align:right; font-weight:bold;">${esc(guests)}</td>
          </tr>
          <tr style="border-top:1px solid #f0f0f0;">
            <td style="padding:10px 0; color:#6b7280;">Name</td>
            <td style="padding:10px 0; text-align:right; font-weight:bold;">${esc(name)}</td>
          </tr>
          ${specialRequests && String(specialRequests).trim()
        ? `<tr style="border-top:1px solid #f0f0f0;">
                 <td style="padding:10px 0; color:#6b7280;">Requests</td>
                 <td style="padding:10px 0; text-align:right;">${esc(specialRequests)}</td>
               </tr>`
        : ''}
        </table>
        <p style="font-size:13px; color:#6b7280; line-height:1.6; margin:22px 0 0;">
          If you need to change or cancel your reservation, please contact ${esc(businessName)} directly.
        </p>
      </div>
    </div>
    <p style="text-align:center; color:#9ca3af; font-size:12px; margin:18px 0 0;">
      Sent via Desi Tracker on behalf of ${esc(businessName)}.
    </p>
  </div>`;
};
exports.bookingConfirmationTemplate = bookingConfirmationTemplate;
const bookingOwnerNotificationTemplate = (data) => {
    const { businessName, name, phone, email, bookingDate, guests, specialRequests } = data;
    const when = formatWhen(bookingDate);
    return `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; background:#f8f9fb; padding: 24px;">
    <div style="background:#ffffff; border-radius:14px; overflow:hidden; border:1px solid #eef0f4;">
      <div style="background:#4f46e5; padding:24px 28px;">
        <h1 style="margin:0; color:#ffffff; font-size:20px;">${esc(businessName)}</h1>
        <p style="margin:6px 0 0; color:#e0e7ff; font-size:14px;">New Reservation 📅</p>
      </div>
      <div style="padding:28px;">
        <p style="font-size:15px; color:#111827; margin:0 0 16px;">
          A new table reservation has just been made at <strong>${esc(businessName)}</strong>.
        </p>
        <table style="width:100%; border-collapse:collapse; font-size:14px; color:#111827;">
          <tr>
            <td style="padding:10px 0; color:#6b7280;">When</td>
            <td style="padding:10px 0; text-align:right; font-weight:bold;">${esc(when)}</td>
          </tr>
          <tr style="border-top:1px solid #f0f0f0;">
            <td style="padding:10px 0; color:#6b7280;">Guests</td>
            <td style="padding:10px 0; text-align:right; font-weight:bold;">${esc(guests)}</td>
          </tr>
          <tr style="border-top:1px solid #f0f0f0;">
            <td style="padding:10px 0; color:#6b7280;">Name</td>
            <td style="padding:10px 0; text-align:right; font-weight:bold;">${esc(name)}</td>
          </tr>
          ${phone && String(phone).trim()
        ? `<tr style="border-top:1px solid #f0f0f0;">
                 <td style="padding:10px 0; color:#6b7280;">Phone</td>
                 <td style="padding:10px 0; text-align:right; font-weight:bold;">${esc(phone)}</td>
               </tr>`
        : ''}
          ${email && String(email).trim()
        ? `<tr style="border-top:1px solid #f0f0f0;">
                 <td style="padding:10px 0; color:#6b7280;">Email</td>
                 <td style="padding:10px 0; text-align:right; font-weight:bold;">${esc(email)}</td>
               </tr>`
        : ''}
          ${specialRequests && String(specialRequests).trim()
        ? `<tr style="border-top:1px solid #f0f0f0;">
                 <td style="padding:10px 0; color:#6b7280;">Requests</td>
                 <td style="padding:10px 0; text-align:right;">${esc(specialRequests)}</td>
               </tr>`
        : ''}
        </table>
        <p style="font-size:13px; color:#6b7280; line-height:1.6; margin:22px 0 0;">
          Open the Desi Tracker app to view or manage this reservation.
        </p>
      </div>
    </div>
    <p style="text-align:center; color:#9ca3af; font-size:12px; margin:18px 0 0;">
      Sent via Desi Tracker for ${esc(businessName)}.
    </p>
  </div>`;
};
exports.bookingOwnerNotificationTemplate = bookingOwnerNotificationTemplate;
