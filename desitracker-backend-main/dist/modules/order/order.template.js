"use strict";
// Branded "new order" email sent to the business owner when a customer places
// an order (home delivery / pickup / dine-in). The business name appears as
// the sender and throughout, matching the customer reservation email style.
Object.defineProperty(exports, "__esModule", { value: true });
exports.newOrderOwnerTemplate = exports.orderTypeLabel = void 0;
const esc = (s) => String(s !== null && s !== void 0 ? s : '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
// Map the stored orderType to a friendly, customer-facing label + emoji.
const orderTypeLabel = (orderType) => {
    switch (orderType) {
        case 'delivery':
            return 'Home Delivery 🛵';
        case 'takeaway':
            return 'Pickup 🥡';
        case 'dine-in':
        default:
            return 'Dine-in 🍽️';
    }
};
exports.orderTypeLabel = orderTypeLabel;
const money = (amount, currency) => {
    const n = Number(amount) || 0;
    return `${esc(currency || '')} ${n.toFixed(2)}`.trim();
};
const newOrderOwnerTemplate = (data) => {
    var _a;
    const { businessName, order } = data;
    const currency = (order === null || order === void 0 ? void 0 : order.currency) || '';
    const typeLabel = (0, exports.orderTypeLabel)(order === null || order === void 0 ? void 0 : order.orderType);
    const items = Array.isArray(order === null || order === void 0 ? void 0 : order.items) ? order.items : [];
    const subtotal = Number(order === null || order === void 0 ? void 0 : order.subtotal) || 0;
    const discount = Number((_a = order === null || order === void 0 ? void 0 : order.membershipDiscount) === null || _a === void 0 ? void 0 : _a.discountAmount) || 0;
    const deliveryFee = Number(order === null || order === void 0 ? void 0 : order.deliveryFee) || 0;
    const total = Math.max(0, subtotal - discount) + deliveryFee;
    const itemRows = items
        .map((it) => {
        var _a, _b;
        return `
      <tr style="border-top:1px solid #f0f0f0;">
        <td style="padding:8px 0; color:#111827;">${esc(it === null || it === void 0 ? void 0 : it.name)}</td>
        <td style="padding:8px 0; text-align:center; color:#6b7280;">x${esc((_a = it === null || it === void 0 ? void 0 : it.quantity) !== null && _a !== void 0 ? _a : 1)}</td>
        <td style="padding:8px 0; text-align:right; color:#111827;">${esc(money(Number(it === null || it === void 0 ? void 0 : it.price) * Number((_b = it === null || it === void 0 ? void 0 : it.quantity) !== null && _b !== void 0 ? _b : 1), currency))}</td>
      </tr>`;
    })
        .join('');
    // Type-specific detail row (delivery address / pickup or table info).
    let extraRow = '';
    if ((order === null || order === void 0 ? void 0 : order.orderType) === 'delivery' && (order === null || order === void 0 ? void 0 : order.deliveryAddress)) {
        extraRow = `
      <tr style="border-top:1px solid #f0f0f0;">
        <td style="padding:10px 0; color:#6b7280;">Deliver to</td>
        <td style="padding:10px 0; text-align:right; font-weight:bold;">${esc(order.deliveryAddress)}</td>
      </tr>`;
    }
    else if ((order === null || order === void 0 ? void 0 : order.orderType) === 'dine-in' && (order === null || order === void 0 ? void 0 : order.tableNo)) {
        extraRow = `
      <tr style="border-top:1px solid #f0f0f0;">
        <td style="padding:10px 0; color:#6b7280;">Table</td>
        <td style="padding:10px 0; text-align:right; font-weight:bold;">${esc(order.tableNo)}</td>
      </tr>`;
    }
    const requestedRow = (order === null || order === void 0 ? void 0 : order.requestedTime)
        ? `
      <tr style="border-top:1px solid #f0f0f0;">
        <td style="padding:10px 0; color:#6b7280;">Requested time</td>
        <td style="padding:10px 0; text-align:right; font-weight:bold;">${esc(order.requestedTime)}</td>
      </tr>`
        : '';
    const phoneRow = (order === null || order === void 0 ? void 0 : order.customerPhone)
        ? `
      <tr style="border-top:1px solid #f0f0f0;">
        <td style="padding:10px 0; color:#6b7280;">Phone</td>
        <td style="padding:10px 0; text-align:right; font-weight:bold;">${esc(order.customerPhone)}</td>
      </tr>`
        : '';
    const customerName = (order === null || order === void 0 ? void 0 : order.customerName) || 'A customer';
    return `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; background:#f8f9fb; padding: 24px;">
    <div style="background:#ffffff; border-radius:14px; overflow:hidden; border:1px solid #eef0f4;">
      <div style="background:#059669; padding:24px 28px;">
        <h1 style="margin:0; color:#ffffff; font-size:20px;">${esc(businessName)}</h1>
        <p style="margin:6px 0 0; color:#d1fae5; font-size:14px;">New ${esc(typeLabel)} order 🛎️</p>
      </div>
      <div style="padding:28px;">
        <p style="font-size:15px; color:#111827; margin:0 0 16px;">
          You've received a new <strong>${esc(typeLabel)}</strong> order from <strong>${esc(customerName)}</strong>.
        </p>

        <table style="width:100%; border-collapse:collapse; font-size:14px; color:#111827; margin:0 0 18px;">
          <tr>
            <td style="padding:8px 0; color:#6b7280; font-weight:bold;">Item</td>
            <td style="padding:8px 0; text-align:center; color:#6b7280; font-weight:bold;">Qty</td>
            <td style="padding:8px 0; text-align:right; color:#6b7280; font-weight:bold;">Amount</td>
          </tr>
          ${itemRows}
        </table>

        <table style="width:100%; border-collapse:collapse; font-size:14px; color:#111827;">
          <tr>
            <td style="padding:8px 0; color:#6b7280;">Subtotal</td>
            <td style="padding:8px 0; text-align:right;">${esc(money(subtotal, currency))}</td>
          </tr>
          ${discount > 0
        ? `<tr><td style="padding:8px 0; color:#6b7280;">Discount</td><td style="padding:8px 0; text-align:right; color:#059669;">- ${esc(money(discount, currency))}</td></tr>`
        : ''}
          ${deliveryFee > 0
        ? `<tr><td style="padding:8px 0; color:#6b7280;">Delivery fee</td><td style="padding:8px 0; text-align:right;">${esc(money(deliveryFee, currency))}</td></tr>`
        : ''}
          <tr style="border-top:2px solid #f0f0f0;">
            <td style="padding:10px 0; color:#111827; font-weight:bold; font-size:16px;">Total</td>
            <td style="padding:10px 0; text-align:right; font-weight:bold; font-size:16px;">${esc(money(total, currency))}</td>
          </tr>
          ${extraRow}
          ${requestedRow}
          ${phoneRow}
        </table>

        ${(order === null || order === void 0 ? void 0 : order.notes) && String(order.notes).trim()
        ? `<p style="font-size:13px; color:#374151; line-height:1.6; margin:18px 0 0; padding:12px; background:#f9fafb; border-radius:8px;"><strong>Note:</strong> ${esc(order.notes)}</p>`
        : ''}

        <p style="font-size:13px; color:#6b7280; line-height:1.6; margin:22px 0 0;">
          Open the Desi Tracker app to manage this order.
        </p>
      </div>
    </div>
    <p style="text-align:center; color:#9ca3af; font-size:12px; margin:18px 0 0;">
      Sent via Desi Tracker for ${esc(businessName)}.
    </p>
  </div>`;
};
exports.newOrderOwnerTemplate = newOrderOwnerTemplate;
