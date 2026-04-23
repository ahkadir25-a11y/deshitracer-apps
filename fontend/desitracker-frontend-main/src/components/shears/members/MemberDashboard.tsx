// /* eslint-disable @typescript-eslint/no-explicit-any */

// "use client";

// import React, { useEffect, useState } from "react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import {
//   User,
//   Phone,
//   MapPin,
//   Camera,
//   Download,
//   QrCode,
//   LogOut,
//   Edit3,
//   Save,
// } from "lucide-react";
// import Link from "next/link";
// import {
//   useGetMemberMeQuery,
//   useUpdateMemberMeMutation,
//   useUploadMemberProfileImageMutation,
// } from "@/app/redux/services/member.service";

// import OffersTab from "./OffersTab";

// /* ==========================================
//    Enhanced Member Dashboard
//    ========================================== */

// export default function EnhancedMemberDashboard() {
//   const router = useRouter();
//   const { data: me, isLoading, refetch } = useGetMemberMeQuery();
//   const [updateMe, { isLoading: saving }] = useUpdateMemberMeMutation();
//   const [uploadImage, { isLoading: uploading }] = useUploadMemberProfileImageMutation();

//   const [form, setForm] = useState({ name: "", phone: "", city: "" });
//   const [editMode, setEditMode] = useState(false);
//   const [activeTab, setActiveTab] = useState<"profile" | "qr" | "offers">("profile");

//   useEffect(() => {
//     if (me) setForm({ name: me.name, phone: me.phone, city: me.city || "" });
//   }, [me]);

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-[#0D1114] text-slate-300 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-8 h-8 border-4 border-slate-700 border-t-[#35B0A6] rounded-full animate-spin mx-auto mb-3" />
//           <p className="text-slate-400 text-sm">Loading your dashboard…</p>
//         </div>
//       </div>
//     );
//   }

//   if (!me) {
//     return (
//       <div className="min-h-screen bg-[#0D1114] text-slate-300 flex items-center justify-center">
//         <p className="text-slate-400 text-sm">Member not found</p>
//       </div>
//     );
//   }

//   const onSave = async () => {
//     await updateMe({
//       name: form.name,
//       phone: form.phone,
//       city: form.city || undefined,
//     }).unwrap();
//     setEditMode(false);
//     refetch();
//   };

//   const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files?.[0]) return;
//     await uploadImage(e.target.files[0]).unwrap();
//     refetch();
//   };

//   const onLogout = () => {
//     document.cookie = `desiTrackerToken=; path=/; max-age=0`;
//     router.replace("/");
//     router.refresh();
//   };

//   return (
//     <div className="min-h-screen bg-[#0D1114] text-[#E6EDF3]">
//       <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(31,107,117,0.20),transparent_60%)]" />
//       <header className="sticky top-0 z-20 bg-[#0D1114]/80 backdrop-blur border-b border-[#243A41]">
//         <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
//           <Link href="/" className="flex items-center gap-3">
//             <div className="flex items-center gap-3">
//               <Image width={60} height={60} src={"/logo.png"} alt="Logo" className="w-16 h-16 rounded-full object-cover" />
//               <div>
//                 <h1 className="text-[15px] font-semibold tracking-tight">Deshi Tracker</h1>
//                 <p className="text-[11px] text-slate-400">Member Dashboard</p>
//               </div>
//             </div>
//           </Link>
//           <div className="flex items-center gap-2.5">
//             <div className="hidden md:flex items-center gap-2">
//               <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-300">
//                 <span className="opacity-70">Serial:</span>
//                 <span className="font-mono ml-1">{me?.serialNumber}</span>
//               </div>
//               <div
//                 className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${
//                   me.active ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" : "bg-white/5 text-slate-300 border-white/10"
//                 }`}
//               >
//                 {me.active ? "🟢 Active" : "🔴 Inactive"}
//               </div>
//             </div>
//             <button
//               onClick={onLogout}
//               className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-200 text-[13px] border border-white/10"
//             >
//               <LogOut className="w-4 h-4" />
//               Logout
//             </button>
//           </div>
//         </div>
//       </header>

//       <main className="mx-auto max-w-7xl px-5 py-8">
//         <nav className="w-full mb-6">
//           <div className="inline-flex rounded-lg bg-white/5 border border-[#243A41] p-1">
//             <TabButton label="Profile" active={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
//             <TabButton label="QR Code" active={activeTab === "qr"} onClick={() => setActiveTab("qr")} />
//             <TabButton label="Offers" active={activeTab === "offers"} onClick={() => setActiveTab("offers")} />
//           </div>
//         </nav>

//         {activeTab === "profile" && (
//           <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <div className="bg-[#151C20] rounded-xl border border-[#243A41] shadow-sm p-5">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-[16px] font-semibold">Profile</h2>
//                 <button
//                   onClick={() => (editMode ? onSave() : setEditMode(true))}
//                   className="p-1.5 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10"
//                 >
//                   {editMode ? <Save className="w-4.5 h-4.5" /> : <Edit3 className="w-4.5 h-4.5" />}
//                 </button>
//               </div>

//               <div className="flex flex-col items-center mb-5">
//                 <div className="relative group">
//                   <img
//                     src={me.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(me.name)}`}
//                     alt="Profile"
//                     className="w-20 h-20 rounded-full object-cover border-2 border-white/10 shadow"
//                   />
//                   <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer">
//                     <Camera className="w-5 h-5 text-white" />
//                     <input type="file" accept="image/*" onChange={onFile} className="hidden" />
//                   </label>
//                   {uploading && (
//                     <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
//                       <div className="w-5 h-5 border-2 border-white/30 border-top-white rounded-full animate-spin" />
//                     </div>
//                   )}
//                 </div>
//                 <h3 className="text-[15px] font-semibold mt-3">{me.name}</h3>
//                 <p className="text-[12px] text-slate-400">Premium Member</p>
//               </div>

//               <div className="space-y-3">
//                 <Field
//                   icon={<User className="w-4 h-4 text-slate-400" />}
//                   value={form.name}
//                   onChange={(v) => setForm((f) => ({ ...f, name: v }))}
//                   placeholder="Full name"
//                   disabled={!editMode || saving}
//                 />
//                 <Field
//                   icon={<Phone className="w-4 h-4 text-slate-400" />}
//                   value={form.phone}
//                   onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
//                   placeholder="Phone number"
//                   disabled={!editMode || saving}
//                 />
//                 <Field
//                   icon={<MapPin className="w-4 h-4 text-slate-400" />}
//                   value={form.city}
//                   onChange={(v) => setForm((f) => ({ ...f, city: v }))}
//                   placeholder="City"
//                   disabled={!editMode || saving}
//                 />
//               </div>
//             </div>

//             <div className="bg-[#151C20] rounded-xl border border-[#243A41] p-5">
//               <h3 className="text-sm font-semibold mb-2">Tips</h3>
//               <ul className="text-[13px] text-slate-400 space-y-1.5 list-disc list-inside">
//                 <li>Tap the avatar to upload a new profile picture.</li>
//                 <li>Keep your contact info up to date for smooth verification.</li>
//                 <li>Use the “Offers” tab to see current day-based discounts.</li>
//               </ul>
//             </div>
//           </section>
//         )}

//         {activeTab === "qr" && (
//           <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <div className="bg-[#151C20] rounded-xl border border-[#243A41] shadow-sm p-5 h-fit">
//               <div className="flex items-center gap-2.5 mb-4">
//                 <QrCode className="w-5 h-5 text-[#35B0A6]" />
//                 <h2 className="text-[16px] font-semibold">Your QR Code</h2>
//               </div>

//               <div className="flex flex-col items-center">
//                 <div className="p-4 bg-[#182227] rounded-lg border border-[#243A41] mb-4">
//                   <img src={me.qrCodeUrl} alt="QR Code" className="w-44 h-44 object-contain" />
//                 </div>
//                 <p className="text-[12px] text-slate-400 text-center mb-4 leading-relaxed">{me.info}</p>
//                 <button
//                   onClick={() => {
//                     const url = me.qrCodeUrl;
//                     if (!url) return;
//                     const a = document.createElement("a");
//                     a.href = url;
//                     a.download = `deshi-tracker-${me.serialNumber}.png`;
//                     a.click();
//                   }}
//                   disabled={!me.qrCodeUrl}
//                   className="flex items-center gap-2 px-4 py-2 rounded-md text-white text-[13px] font-semibold bg-gradient-to-r from-[#1F6B75] to-[#35B0A6] hover:from-[#1b5d65] hover:to-[#2da092] disabled:opacity-60"
//                 >
//                   <Download className="w-4.5 h-4.5" />
//                   Download QR
//                 </button>
//               </div>
//             </div>

//             <div className="bg-[#151C20] rounded-xl border border-[#243A41] p-5">
//               <h3 className="text-sm font-semibold mb-2">How to use</h3>
//               <ol className="text-[13px] text-slate-400 space-y-1.5 list-decimal list-inside">
//                 <li>Save the QR to your gallery.</li>
//                 <li>Show it to partnered businesses to redeem offers.</li>
//                 <li>Keep your membership active for seamless scanning.</li>
//               </ol>
//             </div>
//           </section>
//         )}

//         {activeTab === "offers" && <OffersTab />}
//       </main>
//     </div>
//   );
// }






// function TabButton({
//   label,
//   active,
//   onClick,
// }: {
//   label: string;
//   active: boolean;
//   onClick: () => void;
// }) {
//   return (
//     <button
//       onClick={onClick}
//       className={`px-3.5 py-1.5 rounded-md text-[13px] transition border ${
//         active
//           ? "bg-[#1F6B75]/20 text-[#AEE9E1] border-[#35B0A6]/30 shadow-[inset_0_0_0_1px_rgba(53,176,166,0.25)]"
//           : "text-slate-300 hover:text-slate-100 border-transparent hover:border-white/10 hover:bg-white/5"
//       }`}
//     >
//       {label}
//     </button>
//   );
// }

// function Field({
//   icon,
//   value,
//   onChange,
//   placeholder,
//   disabled,
// }: {
//   icon: React.ReactNode;
//   value: string;
//   onChange: (v: string) => void;
//   placeholder: string;
//   disabled?: boolean;
// }) {
//   return (
//     <div className="relative group">
//       <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>
//       <input
//         className="w-full pl-9 pr-3 py-2 bg-[#182227] border border-[#243A41] rounded-md outline-none focus:border-[#35B0A6] disabled:opacity-60 text-[13px] placeholder:text-slate-500"
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         disabled={disabled}
//         placeholder={placeholder}
//       />
//     </div>
//   );
// }


/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  MapPin,
  Camera,
  Download,
  QrCode,
  LogOut,
  Edit3,
  Save,
  ShieldAlert,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import {
  useGetMemberMeQuery,
  useUpdateMemberMeMutation,
  useUploadMemberProfileImageMutation,
  useCreateDeactivationRequestMutation,
  useGetMyDeactivationRequestsQuery,
} from "@/app/redux/services/member.service";

import OffersTab from "./OffersTab";

/* ==========================================
   Enhanced Member Dashboard
   ========================================== */

export default function EnhancedMemberDashboard() {
  const router = useRouter();
  const { data: me, isLoading, refetch } = useGetMemberMeQuery();
  const [updateMe, { isLoading: saving }] = useUpdateMemberMeMutation();
  const [uploadImage, { isLoading: uploading }] = useUploadMemberProfileImageMutation();

  // 🔹 Deactivation hooks
  const [createRequest, { isLoading: creating, isSuccess: created, error: createError }] =
    useCreateDeactivationRequestMutation();

  const [form, setForm] = useState({ name: "", phone: "", city: "" });
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "qr" | "offers" | "deactivation">(
    "profile"
  );

  // 🔹 Deactivation form state
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [uiError, setUiError] = useState<string | null>(null);

  // Only fetch requests when the Deactivation tab is open
  const {
    data: myRequests,
    isLoading: loadingRequests,
    refetch: refetchMyRequests,
  } = useGetMyDeactivationRequestsQuery(undefined, { skip: activeTab !== "deactivation" });

  useEffect(() => {
    if (me) setForm({ name: me.name, phone: me.phone, city: me.city || "" });
  }, [me]);

  useEffect(() => {
    if (created) {
      setReason("");
      setNote("");
      setUiError(null);
      refetchMyRequests();
    }
  }, [created, refetchMyRequests]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D1114] text-slate-300 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-700 border-t-[#35B0A6] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="min-h-screen bg-[#0D1114] text-slate-300 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Member not found</p>
      </div>
    );
  }

  const onSave = async () => {
    await updateMe({
      name: form.name,
      phone: form.phone,
      city: form.city || undefined,
    }).unwrap();
    setEditMode(false);
    refetch();
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    await uploadImage(e.target.files[0]).unwrap();
    refetch();
  };

  const onLogout = () => {
    document.cookie = `desiTrackerToken=; path=/; max-age=0`;
    router.replace("/");
    router.refresh();
  };

  const submitDeactivation = async () => {
    if (!me.active) {
      setUiError("Your account is already inactive; you can’t submit a deactivation request.");
      return;
    }
    setUiError(null);
    await createRequest({ reason: reason || undefined, note: note || undefined }).unwrap();
  };

  const isInactive = !me.active;
  const canSubmit = me.active && !!reason.trim() && !creating;

  return (
    <div className="min-h-screen bg-[#0D1114] text-[#E6EDF3]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(31,107,117,0.20),transparent_60%)]" />
      <header className="sticky top-0 z-20 bg-[#0D1114]/80 backdrop-blur border-b border-[#243A41]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <Image width={60} height={60} src={"/logo.png"} alt="Logo" className="w-16 h-16 rounded-full object-cover" />
              <div>
                <h1 className="text-[15px] font-semibold tracking-tight">Deshi Tracker</h1>
                <p className="text-[11px] text-slate-400">Member Dashboard</p>
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="hidden md:flex items-center gap-2">
              <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-300">
                <span className="opacity-70">Serial:</span>
                <span className="font-mono ml-1">{me?.serialNumber}</span>
              </div>
              <div
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                  me.active ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" : "bg-white/5 text-slate-300 border-white/10"
                }`}
              >
                {me.active ? "🟢 Active" : "🔴 Inactive"}
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-200 text-[13px] border border-white/10"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8">
        <nav className="w-full mb-6">
          <div className="inline-flex rounded-lg bg-white/5 border border-[#243A41] p-1">
            <TabButton label="Profile" active={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
            <TabButton label="QR Code" active={activeTab === "qr"} onClick={() => setActiveTab("qr")} />
            <TabButton label="Offers" active={activeTab === "offers"} onClick={() => setActiveTab("offers")} />
            <TabButton label="Deactivate" active={activeTab === "deactivation"} onClick={() => setActiveTab("deactivation")} />
          </div>
        </nav>

        {activeTab === "profile" && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#151C20] rounded-xl border border-[#243A41] shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[16px] font-semibold">Profile</h2>
                <button
                  onClick={() => (editMode ? onSave() : setEditMode(true))}
                  className="p-1.5 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10"
                >
                  {editMode ? <Save className="w-4.5 h-4.5" /> : <Edit3 className="w-4.5 h-4.5" />}
                </button>
              </div>

              <div className="flex flex-col items-center mb-5">
                <div className="relative group">
                  <img
                    src={me.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(me.name)}`}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-white/10 shadow"
                  />
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer">
                    <Camera className="w-5 h-5 text-white" />
                    <input type="file" accept="image/*" onChange={onFile} className="hidden" />
                  </label>
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                      <div className="w-5 h-5 border-2 border-white/30 border-top-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <h3 className="text-[15px] font-semibold mt-3">{me.name}</h3>
                <p className="text-[12px] text-slate-400">Premium Member</p>
              </div>

              <div className="space-y-3">
                <Field
                  icon={<User className="w-4 h-4 text-slate-400" />}
                  value={form.name}
                  onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                  placeholder="Full name"
                  disabled={!editMode || saving}
                />
                <Field
                  icon={<Phone className="w-4 h-4 text-slate-400" />}
                  value={form.phone}
                  onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                  placeholder="Phone number"
                  disabled={!editMode || saving}
                />
                <Field
                  icon={<MapPin className="w-4 h-4 text-slate-400" />}
                  value={form.city}
                  onChange={(v) => setForm((f) => ({ ...f, city: v }))}
                  placeholder="City"
                  disabled={!editMode || saving}
                />
              </div>
            </div>

            <div className="bg-[#151C20] rounded-xl border border-[#243A41] p-5">
              <h3 className="text-sm font-semibold mb-2">Tips</h3>
              <ul className="text-[13px] text-slate-400 space-y-1.5 list-disc list-inside">
                <li>Tap the avatar to upload a new profile picture.</li>
                <li>Keep your contact info up to date for smooth verification.</li>
                <li>Use the “Offers” tab to see current day-based discounts.</li>
              </ul>
            </div>
          </section>
        )}

        {activeTab === "qr" && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#151C20] rounded-xl border border-[#243A41] shadow-sm p-5 h-fit">
              <div className="flex items-center gap-2.5 mb-4">
                <QrCode className="w-5 h-5 text-[#35B0A6]" />
                <h2 className="text-[16px] font-semibold">Your QR Code</h2>
              </div>

              <div className="flex flex-col items-center">
                <div className="p-4 bg-[#182227] rounded-lg border border-[#243A41] mb-4">
                  <img src={me.qrCodeUrl} alt="QR Code" className="w-44 h-44 object-contain" />
                </div>
                <p className="text-[12px] text-slate-400 text-center mb-4 leading-relaxed">{me.info}</p>
                <button
                  onClick={() => {
                    const url = me.qrCodeUrl;
                    if (!url) return;
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `deshi-tracker-${me.serialNumber}.png`;
                    a.click();
                  }}
                  disabled={!me.qrCodeUrl}
                  className="flex items-center gap-2 px-4 py-2 rounded-md text-white text-[13px] font-semibold bg-gradient-to-r from-[#1F6B75] to-[#35B0A6] hover:from-[#1b5d65] hover:to-[#2da092] disabled:opacity-60"
                >
                  <Download className="w-4.5 h-4.5" />
                  Download QR
                </button>
              </div>
            </div>

            <div className="bg-[#151C20] rounded-xl border border-[#243A41] p-5">
              <h3 className="text-sm font-semibold mb-2">How to use</h3>
              <ol className="text-[13px] text-slate-400 space-y-1.5 list-decimal list-inside">
                <li>Save the QR to your gallery.</li>
                <li>Show it to partnered businesses to redeem offers.</li>
                <li>Keep your membership active for seamless scanning.</li>
              </ol>
            </div>
          </section>
        )}

        {activeTab === "offers" && <OffersTab />}

        {/* 🔹 Deactivation Tab */}
        {activeTab === "deactivation" && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <div className="bg-[#151C20] rounded-xl border border-[#243A41] p-5">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h2 className="text-[16px] font-semibold">Request Deactivation</h2>
              </div>

              {/* Banner if already inactive */}
              {isInactive && (
                <div className="flex items-start gap-2 p-3 mb-3 rounded-md bg-red-500/10 text-red-200 border border-red-500/20">
                  <XCircle className="w-4 h-4 mt-0.5" />
                  <div className="text-[13px]">
                    Your membership is already <span className="font-medium">inactive</span>. You can’t submit a new deactivation request.
                  </div>
                </div>
              )}

              <p className="text-[12px] text-slate-400 mb-4">
                Submit a request to deactivate your membership. Once <span className="text-slate-300">accepted</span>, your account will be set to{" "}
                <span className="text-red-300 font-medium">inactive</span>.
              </p>

              <div className="space-y-3">
                <TextArea
                  label="Reason (required)"
                  value={reason}
                  onChange={setReason}
                  placeholder="Tell us why you want to deactivate…"
                  rows={4}
                  disabled={isInactive || creating}
                />
                <TextArea
                  label="Additional note (optional)"
                  value={note}
                  onChange={setNote}
                  placeholder="Any extra context for the backoffice team…"
                  rows={3}
                  disabled={isInactive || creating}
                />

                {uiError && <p className="text-[12px] text-red-300">{uiError}</p>}
                {createError && !uiError ? (
                  <p className="text-[12px] text-red-300">
                    {(createError as any)?.data?.message || "Failed to submit request. Please try again."}
                  </p>
                ) : created ? (
                  <p className="text-[12px] text-emerald-300">Your request has been submitted.</p>
                ) : null}

                <button
                  onClick={submitDeactivation}
                  disabled={!canSubmit}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white text-[13px] font-semibold bg-gradient-to-r from-[#1F6B75] to-[#35B0A6] hover:from-[#1b5d65] hover:to-[#2da092] disabled:opacity-60"
                  title={!me.active ? "Account is already inactive" : undefined}
                >
                  <Send className="w-4.5 h-4.5" />
                  {creating ? "Submitting…" : me.active ? "Submit Request" : "Account inactive"}
                </button>
              </div>
            </div>

            {/* My Requests */}
            <div className="bg-[#151C20] rounded-xl border border-[#243A41] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[15px] font-semibold">My Deactivation Requests</h3>
                <button
                  onClick={() => refetchMyRequests()}
                  className="text-[12px] px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10"
                >
                  Refresh
                </button>
              </div>

              {loadingRequests ? (
                <div className="flex items-center gap-2 text-[13px] text-slate-400">
                  <div className="w-4 h-4 border-2 border-slate-700 border-t-[#35B0A6] rounded-full animate-spin" />
                  Loading your requests…
                </div>
              ) : !myRequests || myRequests.length === 0 ? (
                <p className="text-[13px] text-slate-400">No requests yet.</p>
              ) : (
                <ul className="space-y-3">
                  {[...myRequests]
                    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
                    .map((req) => (
                      <li
                        key={req._id}
                        className="p-3 rounded-lg bg-[#182227] border border-[#243A41] flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[13px]">
                            {req.status === "pending" && <Clock className="w-4 h-4 text-amber-300" />}
                            {req.status === "accepted" && <CheckCircle2 className="w-4 h-4 text-emerald-300" />}
                            {req.status === "rejected" && <XCircle className="w-4 h-4 text-red-300" />}
                            <span className="font-medium">{prettyStatus(req.status)}</span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {new Date(req.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {req.reason && (
                          <p className="text-[13px] text-slate-300">
                            <span className="text-slate-400">Reason:</span> {req.reason}
                          </p>
                        )}
                        {req.note && (
                          <p className="text-[12px] text-slate-400">
                            <span className="text-slate-500">Note:</span> {req.note}
                          </p>
                        )}
                        {req.processedNote && (
                          <p className="text-[12px] text-slate-400">
                            <span className="text-slate-500">Processed note:</span> {req.processedNote}
                          </p>
                        )}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function prettyStatus(s: "pending" | "accepted" | "rejected") {
  if (s === "accepted") return "Accepted";
  if (s === "rejected") return "Rejected";
  return "Pending";
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-md text-[13px] transition border ${
        active
          ? "bg-[#1F6B75]/20 text-[#AEE9E1] border-[#35B0A6]/30 shadow-[inset_0_0_0_1px_rgba(53,176,166,0.25)]"
          : "text-slate-300 hover:text-slate-100 border-transparent hover:border-white/10 hover:bg-white/5"
      }`}
    >
      {label}
    </button>
  );
}

function Field({
  icon,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>
      <input
        className="w-full pl-9 pr-3 py-2 bg-[#182227] border border-[#243A41] rounded-md outline-none focus:border-[#35B0A6] disabled:opacity-60 text-[13px] placeholder:text-slate-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  disabled,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}) {
  return (
    <div className="w-full">
      {label && <label className="block text-[12px] text-slate-300 mb-1">{label}</label>}
      <textarea
        className="w-full px-3 py-2 bg-[#182227] border border-[#243A41] rounded-md outline-none focus:border-[#35B0A6] text-[13px] placeholder:text-slate-500 resize-y disabled:opacity-60"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
      />
    </div>
  );
}
