/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IDayOffer,
  useCreateDayOfferMutation,
  useDeleteDayOfferMutation,
  useGetProductsCategoryByUserAndBusinessQuery,
  useListDayOffersQuery,
  useUpdateDayOfferMutation,
  Weekday,
} from '@/app/redux/services/products.services';

type Props = {
  userId: string;
  businessId: string;
  className?: string;
};

const WEEKDAYS: Weekday[] = [
  'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'
];

// ---------------- UI helpers ----------------
function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

/** Parse a YYYY-MM-DD from <input type="date"> safely */
function dateInputToISO(dateStr?: string | null) {
  if (!dateStr) return null;
  // Force local midnight to avoid timezone off-by-one when user picks a date
  const d = new Date(`${dateStr}T00:00:00`);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function prettyDate(v?: string | null) {
  if (!v) return '—';
  const d = new Date(v);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function isToday(weekday: Weekday) {
  const idx = new Date().getDay(); // 0=Sun
  const todayName = (['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][idx]) as Weekday;
  return weekday === todayName;
}

function statusOf(offer: IDayOffer) {
  const now = new Date();
  const start = offer.start_date ? new Date(offer.start_date) : null;
  const end = offer.end_date ? new Date(offer.end_date) : null;
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const inRange =
    (!start || start <= now) &&
    (!end || end >= endOfToday);

  if (end && end < now) return { label: 'Expired', tone: 'red' as const };
  if (!inRange) return { label: 'Scheduled', tone: 'amber' as const };
  if (inRange && isToday(offer.day)) return { label: 'Active today', tone: 'green' as const };
  return { label: 'In range', tone: 'gray' as const };
}

function Chip({
  tone = 'gray',
  children,
}: {
  tone?: 'green' | 'red' | 'amber' | 'gray';
  children: React.ReactNode;
}) {
  const map = {
    green: 'bg-green-50 text-green-700 ring-green-600/20',
    red: 'bg-red-50 text-red-700 ring-red-600/20',
    amber: 'bg-amber-50 text-amber-800 ring-amber-600/20',
    gray: 'bg-gray-100 text-gray-700 ring-gray-500/20',
  } as const;
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1',
      map[tone]
    )}>
      {children}
    </span>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      'rounded-xl border border-gray-200 bg-white shadow-sm',
      className
    )}>
      {children}
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="p-3"><div className="h-4 w-28 bg-gray-200 rounded" /></td>
      <td className="p-3"><div className="h-4 w-14 bg-gray-200 rounded" /></td>
      <td className="p-3"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
      <td className="p-3"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
      <td className="p-3"><div className="h-5 w-24 bg-gray-200 rounded" /></td>
      <td className="p-3"><div className="h-8 w-24 bg-gray-200 rounded" /></td>
    </tr>
  );
}

// ---- Inline Confirm Popup (no modal/portal) ----
function ConfirmPopup({
  title = 'Are you sure?',
  desc,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  className = '',
}: {
  title?: string;
  desc?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    const onDown = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onCancel();
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [onCancel]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="false"
      className={cn(
        'z-10 w-64 rounded-lg border border-gray-200 bg-white shadow-xl p-3',
        'relative', // for the arrow
        className
      )}
    >
      <div className="text-sm font-medium text-gray-900">{title}</div>
      {desc && <p className="mt-1 text-xs text-gray-600">{desc}</p>}

      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {loading ? 'Working…' : confirmText}
        </button>
      </div>

      {/* little arrow */}
      <div className="pointer-events-none absolute -top-2 right-6 h-0 w-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white drop-shadow" />
    </div>
  );
}

// ---- Tiny Toast (auto-hide) ----
function Toast({
  type = 'info',
  message,
  onClose,
  duration = 3000,
}: {
  type?: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
  duration?: number;
}) {
  React.useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  const tone =
    type === 'success'
      ? 'bg-green-600'
      : type === 'error'
      ? 'bg-red-600'
      : 'bg-gray-800';

  return (
    <div className="fixed bottom-4 right-4 z-20">
      <div className={cn('text-white rounded-md px-3 py-2 text-sm shadow-lg', tone)}>
        {message}
      </div>
    </div>
  );
}

// ---------------- Component ----------------
export default function DayOffersManager({ userId, businessId, className = '' }: Props) {
  // Data
  const { data: offers, isLoading, isFetching } = useListDayOffersQuery({ user_id: userId, business_id: businessId });
  useGetProductsCategoryByUserAndBusinessQuery({ user_id: userId, business_id: businessId }); // keep warm for future category UI

  // Mutations
  const [createOffer, { isLoading: creating }] = useCreateDayOfferMutation();
  const [updateOffer] = useUpdateDayOfferMutation();
  const [deleteOffer, { isLoading: deleting }] = useDeleteDayOfferMutation();

  // Create form state
  const [form, setForm] = React.useState<{
    day: Weekday | '';
    discount_percent: string;
    product_category_id?: string;
    start_date: string;
    end_date: string;
  }>({
    day: '',
    discount_percent: '',
    product_category_id: '',
    start_date: '',
    end_date: '',
  });

  // Inline edit state
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editDraft, setEditDraft] = React.useState<Partial<IDayOffer>>({});

  // Filters
  const [query, setQuery] = React.useState('');
  const [weekdayFilter, setWeekdayFilter] = React.useState<Weekday | 'All'>('All');

  // UI overlays
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null);

  const onChange = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }));
  const resetForm = () => setForm({ day: '', discount_percent: '', product_category_id: '', start_date: '', end_date: '' });
  const validatePercent = (p: string) => {
    const n = Number(p);
    return Number.isFinite(n) && n >= 0 && n <= 100;
  };
  const percentValid = form.discount_percent === '' ? null : validatePercent(form.discount_percent);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.day) { setToast({ type: 'error', msg: 'Please choose a weekday.' }); return; }
    if (!validatePercent(form.discount_percent)) { setToast({ type: 'error', msg: 'Discount must be 0–100.' }); return; }
    if (!form.start_date) { setToast({ type: 'error', msg: 'Start date is required.' }); return; }
    try {
      await createOffer({
        user_id: userId,
        business_id: businessId,
        product_category_id: form.product_category_id || undefined,
        day: form.day,
        discount_percent: Number(form.discount_percent),
        start_date: dateInputToISO(form.start_date)!,
        end_date: dateInputToISO(form.end_date),
      }).unwrap();
      resetForm();
      setToast({ type: 'success', msg: 'Day offer created' });
    } catch (err: any) {
      setToast({ type: 'error', msg: err?.data?.error || 'Failed to create offer' });
    }
  };

  const beginEdit = (o: IDayOffer) => {
    setEditingId(o._id);
    setEditDraft({
      ...o,
      product_category_id: o.product_category_id ?? '',
      start_date: o.start_date ?? '',
      end_date: o.end_date ?? '',
    });
  };
  const cancelEdit = () => { setEditingId(null); setEditDraft({}); };

  const commitEdit = async () => {
    if (!editingId) return;
    const body: any = {};
    if (editDraft.day) body.day = editDraft.day;
    if (typeof editDraft.discount_percent !== 'undefined') {
      if (!validatePercent(String(editDraft.discount_percent))) { setToast({ type: 'error', msg: 'Discount must be 0–100.' }); return; }
      body.discount_percent = Number(editDraft.discount_percent);
    }
    if (typeof editDraft.product_category_id !== 'undefined') {
      body.product_category_id = editDraft.product_category_id || null;
    }
    if ('start_date' in editDraft || 'end_date' in editDraft) {
      const start = editDraft.start_date ? dateInputToISO(String(editDraft.start_date)) : undefined;
      const end = editDraft.end_date === null ? null : editDraft.end_date ? dateInputToISO(String(editDraft.end_date)) : undefined;
      if (start) body.start_date = start;
      if (typeof end !== 'undefined') body.end_date = end;
    }
    try {
      await updateOffer({ id: editingId, updates: body }).unwrap();
      cancelEdit();
      setToast({ type: 'success', msg: 'Day offer updated' });
    } catch (err: any) {
      setToast({ type: 'error', msg: err?.data?.error || 'Failed to update offer' });
    }
  };

  // Delete: open popup instead of window.confirm
  const handleDelete = (id: string) => setConfirmDeleteId(id);

  // Do actual delete when confirmed
  const doDeleteConfirmed = async (id: string) => {
    try {
      await deleteOffer(id).unwrap();
      setToast({ type: 'success', msg: 'Day offer deleted' });
    } catch (err: any) {
      setToast({ type: 'error', msg: err?.data?.error || 'Failed to delete offer' });
    } finally {
      setConfirmDeleteId(null);
    }
  };




  const todayLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

  const filtered = (offers ?? [])
    .filter(o => (weekdayFilter === 'All' ? true : o.day === weekdayFilter))
    .filter(o => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        o.day.toLowerCase().includes(q) ||
        String(o.discount_percent).includes(q) ||
        prettyDate(o.start_date).toLowerCase().includes(q) ||
        prettyDate(o.end_date).toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const aActive = isToday(a.day) ? 1 : 0;
      const bActive = isToday(b.day) ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;
      const ad = a.start_date ? +new Date(a.start_date) : 0;
      const bd = b.start_date ? +new Date(b.start_date) : 0;
      return bd - ad;
    });

  const fieldBase = "w-full rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/80";
  const btnBase   = "inline-flex items-center justify-center rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/80 disabled:opacity-60 disabled:cursor-not-allowed";
  const btn     = {
    primary: cn(btnBase, "bg-black text-white px-3 py-2 hover:opacity-90"),
    ghost:   cn(btnBase, "border border-gray-300 bg-white px-3 py-2 text-gray-900 hover:bg-gray-50"),
    danger:  cn(btnBase, "border border-red-200 text-red-700 bg-white px-3 py-2 hover:bg-red-50"),
    subtle:  cn(btnBase, "px-2.5 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50"),
  };

  return (
    <div className={cn("space-y-6 mb-4", className)}>
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Day Offers</h2>
          <p className="text-sm text-gray-500">Create and manage weekly day-based discounts.</p>
          <div className="mt-1 text-xs text-gray-500">
            Today: <span className="font-medium">{todayLabel}</span>
          </div>
        </div>
      
      </div>

      {/* Create form */}
      <Card>
        <motion.form
          layout
          onSubmit={handleCreate}
          className="p-4"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-1">Weekday</label>
              <select
                value={form.day}
                onChange={(e) => onChange('day', e.target.value)}
                className={fieldBase}
                required
              >
                <option value="" disabled>Select day</option>
                {WEEKDAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-1">% Discount</label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={100}
                  step={1}
                  value={form.discount_percent}
                  onChange={(e) => onChange('discount_percent', e.target.value)}
                  className={cn(fieldBase, "pr-7", percentValid === false && "border-red-400")}
                  placeholder="e.g., 15"
                  aria-invalid={percentValid === false}
                  required
                />
                <span className="absolute inset-y-0 right-2 flex items-center text-gray-400 text-sm">%</span>
              </div>
              {percentValid === false && <p className="mt-1 text-xs text-red-600">Must be 0–100.</p>}
            </div>

            {/* (Optional) Category select – keep commented if unused
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Category (optional)</label>
              <select
                value={form.product_category_id}
                onChange={(e) => onChange('product_category_id', e.target.value)}
                className={fieldBase}
              >
                <option value="">All products</option>
                {categories?.map((c: any) => (
                  <option key={c._id} value={c._id}>{c.name || c.title || c._id}</option>
                ))}
              </select>
            </div> */}

            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => onChange('start_date', e.target.value)}
                className={fieldBase}
                required
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-1">End Date (optional)</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => onChange('end_date', e.target.value)}
                className={fieldBase}
              />
            </div>

            <div className="md:col-span-1 flex items-end gap-2">
              <button
                type="submit"
                disabled={creating || percentValid === false}
                className={btn.primary}
              >
                {creating ? 'Creating…' : 'Create Offer'}
              </button>
              <button type="button" onClick={resetForm} className={btn.subtle}>
                Reset
              </button>
            </div>
          </div>
        </motion.form>
      </Card>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by day, % or date…"
            className={cn(fieldBase, "pl-9")}
            aria-label="Search offers"
          />
          <svg
            viewBox="0 0 24 24"
            className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
            fill="currentColor" aria-hidden
          >
            <path d="M10 4a6 6 0 104.472 10.106l3.361 3.361 1.414-1.414-3.361-3.361A6 6 0 0010 4zm0 2a4 4 0 110 8 4 4 0 010-8z"/>
          </svg>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <select
            value={weekdayFilter}
            onChange={(e) => setWeekdayFilter(e.target.value as Weekday | 'All')}
            className={fieldBase}
            aria-label="Filter by weekday"
          >
            <option value="All">All days</option>
            {WEEKDAYS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          {(isFetching || isLoading) && <span className="text-xs text-gray-500" aria-live="polite">Loading…</span>}
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-medium text-gray-700">Weekday</th>
                <th className="text-left p-3 font-medium text-gray-700">% Discount</th>
                <th className="text-left p-3 font-medium text-gray-700">Start</th>
                <th className="text-left p-3 font-medium text-gray-700">End</th>
                <th className="text-left p-3 font-medium text-gray-700">Status</th>
                <th className="text-right p-3 font-medium text-gray-700 w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {isLoading && (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                )}

                {!isLoading && filtered.length > 0 && filtered.map((o) => {
                  const st = statusOf(o);
                  const editing = editingId === o._id;

                  return (
                    <motion.tr
                      key={o._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        "group border-t last:border-b hover:bg-amber-50/40",
                        st.label === 'Expired' && "opacity-70"
                      )}
                    >
                      {/* Weekday */}
                      <td className="p-3 align-middle">
                        <div className="flex items-center">
                          <span className="mr-2 inline-block h-4 w-1.5 rounded-full bg-gradient-to-b from-amber-400 via-fuchsia-400 to-sky-400" />
                          {editing ? (
                            <select
                              className={cn(fieldBase, "h-8 py-1 w-36")}
                              value={String(editDraft.day || o.day)}
                              onChange={(e) => setEditDraft((d) => ({ ...d, day: e.target.value as Weekday }))}
                            >
                              {WEEKDAYS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          ) : (
                            <span className="font-medium">
                              {o.day}
                              {isToday(o.day) && <span className="ml-2 text-xs text-amber-700">• today</span>}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Discount */}
                      <td className="p-3 align-middle">
                        {editing ? (
                          <div className="relative inline-flex">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              step={1}
                              className={cn(fieldBase, "h-8 py-1 w-24 pr-6")}
                              value={String(
                                typeof editDraft.discount_percent !== 'undefined'
                                  ? editDraft.discount_percent
                                  : o.discount_percent
                              )}
                              onChange={(e) => setEditDraft((d) => ({ ...d, discount_percent: Number(e.target.value) }))}
                            />
                            <span className="absolute right-2 inset-y-0 flex items-center text-gray-400 text-xs">%</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center rounded-md border border-gray-200 px-2 py-0.5 text-xs font-medium">
                            {o.discount_percent}% off
                          </span>
                        )}
                      </td>

                      {/* Start */}
                      <td className="p-3 align-middle">
                        {editing ? (
                          <input
                            type="date"
                            className={cn(fieldBase, "h-8 py-1")}
                            value={(editDraft.start_date as any)?.slice?.(0, 10) ?? (o.start_date ? o.start_date.slice(0, 10) : '')}
                            onChange={(e) => setEditDraft((d) => ({ ...d, start_date: e.target.value }))}
                          />
                        ) : (
                          prettyDate(o.start_date)
                        )}
                      </td>

                      {/* End */}
                      <td className="p-3 align-middle">
                        {editing ? (
                          <input
                            type="date"
                            className={cn(fieldBase, "h-8 py-1")}
                            value={(editDraft.end_date as any)?.slice?.(0, 10) ?? (o.end_date ? o.end_date.slice(0, 10) : '')}
                            onChange={(e) => setEditDraft((d) => ({ ...d, end_date: e.target.value }))}
                          />
                        ) : (
                          prettyDate(o.end_date)
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3 align-middle">
                        <Chip tone={st.tone}>{st.label}</Chip>
                      </td>

                      {/* Actions */}
                      <td className="p-3 align-middle text-right whitespace-nowrap">
                        {editing ? (
                          <div className="inline-flex gap-2">
                            <button onClick={commitEdit} className={btn.primary}>Save</button>
                            <button onClick={cancelEdit} className={btn.ghost}>Cancel</button>
                          </div>
                        ) : (
                          <div className="relative inline-flex gap-2">
                            <button
                              onClick={() => beginEdit(o)}
                              className={btn.ghost}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(o._id)}
                              disabled={deleting}
                              className={btn.danger}
                            >
                              Delete
                            </button>

                            {confirmDeleteId === o._id && (
                              <ConfirmPopup
                                title="Delete this offer?"
                                desc={`${o.day} • ${o.discount_percent}% off`}
                                confirmText="Delete"
                                cancelText="Cancel"
                                onCancel={() => setConfirmDeleteId(null)}
                                onConfirm={() => doDeleteConfirmed(o._id)}
                                className="absolute right-0 top-full mt-2"
                              />
                            )}
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}

                {!isLoading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-10 text-center">
                      <div className="mx-auto max-w-sm">
                        <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-400" fill="currentColor"><path d="M10 4a6 6 0 014.472 10.106l3.361 3.361-1.414 1.414-3.361-3.361A6 6 0 1110 4z"/></svg>
                        </div>
                        <p className="text-sm text-gray-600">
                          {offers?.length ? 'No matches for your filters.' : 'No day offers yet. Create one above.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.msg}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
