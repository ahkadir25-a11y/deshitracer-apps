/* src/components/members/LeadPromotionSender.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import { useSendPromotionToLeadsMutation } from "@/app/redux/services/member.service";
import { useListDayOffersQuery, IDayOffer } from "@/app/redux/services/products.services";
import { FiSend, FiRefreshCw } from "react-icons/fi";

type Props = {
  userId: string;
  businessId: string;
};

export default function LeadPromotionSender({ userId, businessId }: Props) {
  // 1) Get offers (same hook your DayOffersManager uses)
  const { data: offers, isLoading, isFetching, refetch } = useListDayOffersQuery({
    user_id: userId,
    business_id: businessId,
  });

  // 2) Send promo mutation
  const [sendPromo, { isLoading: sending }] = useSendPromotionToLeadsMutation();

  // UI state
  const [offerId, setOfferId] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  const selectedOffer: IDayOffer | undefined = useMemo(
    () => (offers || []).find((o: any) => o._id === offerId),
    [offers, offerId]
  );

  const onSend = async () => {
    if (!offerId) return;

    setResultMsg(null);
    try {
      const res = await sendPromo({
        offerId,
        ownerId: userId,
        subject: subject.trim() || undefined,
        message: message.trim() || undefined,
      }).unwrap();

      setResultMsg(
        `✅ Sent: ${res.sent}, Failed: ${res.failed}, Skipped(no email): ${res.skippedNoEmail} (Total leads: ${res.totalLeads})`
      );
    } catch (e: any) {
      const m = e?.data?.message || e?.error || "Failed to send promotion";
      setResultMsg(`⚠️ ${m}`);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Send Promotion to My Leads</h3>
          <p className="text-sm text-gray-500">
            Select an offer and email it to your saved leads.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-100 text-gray-800 px-3 py-2 text-sm font-medium hover:bg-gray-200"
          disabled={isFetching}
        >
          <FiRefreshCw className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Offer select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Offer</label>
          <select
            value={offerId}
            onChange={(e) => setOfferId(e.target.value)}
            className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 outline-none"
            disabled={isLoading || isFetching}
          >
            <option value="">Select an offer…</option>
            {(offers || []).map((o: any) => (
              <option key={o._id} value={o._id}>
                {o.day} • {o.discount_percent}% • {String(o.start_date || "").slice(0, 10)} →{" "}
                {String(o.end_date || "").slice(0, 10)}
              </option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Optional (default will be used)"
            className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 outline-none"
          />
        </div>

        {/* Message */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Custom message (optional)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a short message to your leads..."
            className="w-full min-h-[110px] rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Preview */}
      {selectedOffer && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
          <div className="font-medium text-gray-900 mb-1">Preview</div>
          <div>
            Offer: <b>{selectedOffer.day}</b> • <b>{selectedOffer.discount_percent}%</b>
          </div>
          <div>
            Date: {String(selectedOffer.start_date || "").slice(0, 10)} →{" "}
            {String(selectedOffer.end_date || "").slice(0, 10) || "—"}
          </div>
        </div>
      )}

      {/* Action */}
      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={onSend}
          disabled={!offerId || sending}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-700 disabled:opacity-60"
        >
          <FiSend />
          {sending ? "Sending..." : "Send to My Leads"}
        </button>

        {resultMsg && <div className="text-sm text-gray-700">{resultMsg}</div>}
      </div>
    </div>
  );
}