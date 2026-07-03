'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from 'react';

type SelectedOption = {
  optionGroupId: string;
  optionGroupName: string;
  value: string;
};

type ReceiptItem = {
  lineId?: string; // ✅ important for unique rows
  productId: string;
  name: string;
  price?: number;
  quantity: number;
  currency?: string;
  selectedOptions?: SelectedOption[]; // ✅ NEW
  product_options_ids?: any[]; // optional
};

type MembershipDiscountPayload = {
  applied: boolean;
  percent: number;
  discountAmount: number;
  payable: number;
  offer: any | null;
};

type ReceiptPayload = {
  createdAt: string;
  businessId: string;
  businessName?: string;
  userId: string;
  tableNo: string;
  notes: string;
  items: ReceiptItem[];
  totals: { totalQty: number; subtotal: number };
  membershipDiscount?: MembershipDiscountPayload;
  currency?: string;
};

function currencySymbol(cur?: string) {
  const c = (cur || '').toUpperCase();
  if (c === 'BDT') return '৳';
  if (c === 'USD') return '$';
  if (c === 'EUR') return '€';
  if (c === 'GBP') return '£';
  if (c === 'INR') return '₹';
  if (c === 'AED') return 'د.إ';
  if (c === 'SAR') return '﷼';
  if (c === 'QAR') return 'ر.ق';
  return c ? `${c} ` : '';
}

function formatMoney(n?: number, currency?: string) {
  if (typeof n !== 'number') return '';
  return `${currencySymbol(currency)}${n.toFixed(2)}`;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function GenerateReceiptPage() {
  const [data, setData] = useState<ReceiptPayload | null>(null);
  const [missing, setMissing] = useState(false);

  const key = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(window.location.search);
    return params.get('key') ?? '';
  }, []);

  useEffect(() => {
    if (!key) {
      setMissing(true);
      return;
    }
    const raw = localStorage.getItem(key);
    if (!raw) {
      setMissing(true);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as ReceiptPayload;
      setData(parsed);
    } catch {
      setMissing(true);
    }
  }, [key]);

  const handlePrint = () => {
    requestAnimationFrame(() => {
      window.print();
      setTimeout(() => {
        if (key) localStorage.removeItem(key);
      }, 1000);
    });
  };

  if (missing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-10">
        <div className="mx-auto w-full max-w-xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-rose-50 text-rose-700 border border-rose-100">
                <span className="text-lg font-black">!</span>
              </div>
              <div className="flex-1">
                <p className="text-lg font-extrabold text-gray-900">Receipt data not found</p>
                <p className="mt-1 text-sm text-gray-600">
                  Go back to the waiter pad and click <span className="font-semibold">Print/PDF</span> again.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => window.close()}
                    className="rounded-2xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-black transition"
                  >
                    Close tab
                  </button>
                  <button
                    onClick={() => (window.location.href = '/')}
                    className="rounded-2xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-50 transition"
                  >
                    Go home
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-rose-200 via-rose-400 to-rose-200" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-10">
        <div className="mx-auto w-full max-w-xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="animate-pulse space-y-3">
            <div className="h-5 w-48 rounded bg-gray-200" />
            <div className="h-4 w-72 rounded bg-gray-200" />
            <div className="mt-4 h-24 w-full rounded-2xl bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  const currency =
    data.currency ||
    data.items?.find((x) => x.currency)?.currency ||
    'USD';

  const subtotal = data.totals?.subtotal ?? 0;

  const member = data.membershipDiscount;
  const discountApplied = !!member?.applied && (member?.percent ?? 0) > 0;

  const discountAmount = discountApplied ? Number(member?.discountAmount || 0) : 0;
  const payable = discountApplied ? Number(member?.payable || subtotal) : subtotal;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-md print:hidden mb-5 flex items-center justify-between gap-3">
        <button
          onClick={() => window.close()}
          className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-50 transition"
        >
          Close
        </button>
        <button
          onClick={handlePrint}
          className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-blue-700 active:bg-blue-800 transition"
        >
          Print / Save PDF
        </button>
      </div>

      <div id="print-receipt" className="mx-auto w-full max-w-md">
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg print:shadow-none">
          <div className="h-2 w-full bg-gradient-to-r from-blue-200 via-blue-500 to-blue-200 print:hidden" />
          <div className="absolute inset-0 opacity-[0.035] pointer-events-none bg-[radial-gradient(circle_at_1px_1px,black_1px,transparent_0)] [background-size:14px_14px] print:hidden" />

          <div className="relative p-6 print:p-4">
            <div className="text-center">
              <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase">Receipt</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-gray-900">
                {data.businessName || 'Restaurant Name'}
              </h1>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 print:bg-transparent">
                <p className="text-[11px] font-semibold text-gray-500">Table</p>
                <p className="text-base font-extrabold text-gray-900">{data.tableNo || '-'}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 print:bg-transparent">
                <p className="text-[11px] font-semibold text-gray-500">Generated</p>
                <p className="text-sm font-bold text-gray-900">{formatDateTime(data.createdAt)}</p>
              </div>
            </div>

            {discountApplied && (
              <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 print:bg-transparent">
                <p className="text-[11px] font-extrabold tracking-widest text-green-700 uppercase print:text-gray-600">
                  Membership Discount Applied
                </p>
                <p className="mt-1 text-sm font-semibold text-green-900 print:text-gray-900">
                  {member?.percent}% off today
                </p>
              </div>
            )}

            {data.notes?.trim() && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 print:bg-transparent">
                <p className="text-[11px] font-extrabold tracking-widest text-amber-700 uppercase print:text-gray-600">
                  Notes
                </p>
                <p className="mt-1 text-sm font-semibold text-amber-900 print:text-gray-900">{data.notes}</p>
              </div>
            )}

            <div className="mt-6 border-t border-dashed border-gray-300" />

            <div className="mt-4 flex items-center text-[11px] font-extrabold tracking-widest text-gray-500 uppercase">
              <div className="flex-1">Item</div>
              <div className="w-12 text-center">Qty</div>
              <div className="w-24 text-right">Total</div>
            </div>

            <div className="mt-3 space-y-3">
              {data.items.map((it, index) => {
                const lineTotal =
                  typeof it.price === 'number' ? it.price * it.quantity : undefined;

                return (
                  <div
                    key={it.lineId || `${it.productId}_${index}`}
                    className="rounded-2xl border border-gray-200 p-4 print:rounded-none print:border-0 print:border-b print:border-dashed print:border-gray-300 print:px-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-extrabold text-gray-900 truncate">{it.name}</p>

                        <div className="mt-1 text-xs text-gray-600">
                          {typeof it.price === 'number' ? (
                            <span>
                              {formatMoney(it.price, it.currency || currency)}{' '}
                              <span className="text-gray-400">each</span>
                            </span>
                          ) : (
                            <span className="text-gray-400">Price N/A</span>
                          )}
                        </div>

                        {/* ✅ SHOW SELECTED OPTIONS */}
                        {Array.isArray(it.selectedOptions) && it.selectedOptions.length > 0 && (
                          <div className="mt-2 flex flex-col gap-1">
                            {it.selectedOptions.map((opt) => (
                              <div
                                key={`${opt.optionGroupId}_${opt.value}`}
                                className="text-[11px] font-semibold text-gray-600"
                              >
                                <span className="text-gray-500">{opt.optionGroupName}:</span>{' '}
                                <span className="text-gray-900">{opt.value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="w-12 text-center">
                        <span className="inline-flex min-w-[44px] justify-center rounded-xl bg-gray-100 px-2 py-1 text-sm font-black text-gray-900 print:bg-transparent print:px-0 print:min-w-0 print:rounded-none">
                          {it.quantity}
                        </span>
                      </div>

                      <div className="w-24 text-right">
                        <p className="text-sm font-black text-gray-900">
                          {typeof lineTotal === 'number'
                            ? formatMoney(lineTotal, it.currency || currency)
                            : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 border-t border-dashed border-gray-300 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Qty</span>
                <span className="font-extrabold text-gray-900">{data.totals.totalQty}</span>
              </div>

              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-extrabold text-gray-900">{formatMoney(subtotal, currency)}</span>
              </div>

              {discountApplied && (
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-gray-600">Membership discount ({member?.percent}%)</span>
                  <span className="font-extrabold text-green-700">
                    - {formatMoney(discountAmount, currency)}
                  </span>
                </div>
              )}

              <div className="mt-3 rounded-2xl bg-gray-900 p-4 text-white print:rounded-none">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white/80">Payable</span>
                  <span className="text-lg font-black">{formatMoney(payable, currency)}</span>
                </div>
              </div>

              <p className="mt-5 text-center text-xs text-gray-500">
                Thank you — please serve with care.
              </p>
            </div>
          </div>

          <div className="print:hidden">
            <div className="h-4 w-full bg-[radial-gradient(circle_at_10px_-2px,transparent_10px,white_11px)] [background-size:20px_20px]" />
            <div className="h-1 w-full bg-gray-100" />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden !important;
          }

          #print-receipt,
          #print-receipt * {
            visibility: visible !important;
          }

          #print-receipt {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          html,
          body {
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          @page {
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}