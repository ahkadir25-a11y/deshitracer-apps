/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React from "react";
import {
  Eye, EyeOff, User, Phone, Mail, MapPin, Lock, ArrowRight,
} from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  useLoginMemberMutation,
  useRegisterMemberMutation,
} from "@/app/redux/services/member.service";
import Image from "next/image";
import { useGetSettingsQuery } from "@/app/redux/services/settings";

type AuthMode = "login" | "register";

function setAuthCookie(token: string) {
  const value = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  document.cookie = `desiTrackerToken=${value}; path=/; max-age=${60 * 60 * 24 * 7}`;
}

export default function EnhancedMembersAuthPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { data: currentSettings } = useGetSettingsQuery({});

  const next = params.get("next") || "/members/dashboard";
  const modeFromUrl =
    (params.get("mode")?.toLowerCase() as AuthMode) === "register"
      ? "register"
      : "login";

  const [mode, setMode] = React.useState<AuthMode>(modeFromUrl);
  const [form, setForm] = React.useState({
    name: "",
    phone: "",
    password: "",
    city: "",
    email: "",
  });
  const [err, setErr] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const [login, { isLoading: isLogging }] = useLoginMemberMutation();
  const [registerMember, { isLoading: isRegistering }] =
    useRegisterMemberMutation();
  const isLoading = isLogging || isRegistering;

  // sync with ?mode=
  React.useEffect(() => {
    setMode(modeFromUrl);
    setErr("");
    setForm({ name: "", phone: "", password: "", city: "", email: "" });
  }, [modeFromUrl]);

  // replace URL (no full navigation)
  const setModeInUrl = (m: AuthMode) => {
    const sp = new URLSearchParams(params.toString());
    sp.set("mode", m);
    router.replace(`${pathname}?${sp.toString()}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    try {
      if (mode === "login") {
        const res = await login({
          phone: form.phone.trim(),
          password: form.password,
        }).unwrap();
        setAuthCookie(res.token);
      } else {
        const res = await registerMember({
          name: form.name.trim(),
          phone: form.phone.trim(),
          password: form.password,
          city: form.city || undefined,
          email: form.email || undefined,
        }).unwrap();
        setAuthCookie(res.token);
      }
      router.replace(next);
      router.refresh();
    } catch (e: any) {
      setErr(e?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-900">
      {/* subtle mini glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-purple-500/10 blur-2xl" />
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-3 py-8">
        <div className="w-full max-w-sm">
          {/* Header — smaller */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-xl bg-white/10 border border-white/15 shadow mb-3">
              <Image
                width={96}
                height={96}
                src={currentSettings?.data?.logo || "/logo.png"}
                alt="Logo"
                className="w-20 h-20 rounded-full"
              />
            </div>
            <div className="mt-1">
              <h2 className="text-base font-semibold text-white/90 mb-0.5">
                {mode === "login" ? "Member Login" : "Join Our Membership"}
              </h2>
              <p className="text-white/60 text-xs">
                {mode === "login"
                  ? "Access your member benefits and dashboard"
                  : "Become a member to unlock exclusive features"}
              </p>
            </div>
          </div>

          {/* Card — tighter paddings/radii/fonts */}
          <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl p-5">
            {/* Error */}
            {err && (
              <div className="mb-4 p-3 rounded-xl text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20">
                {err}
              </div>
            )}

           {/* Form */}
<form className="space-y-4" onSubmit={handleSubmit}>
  {mode === "register" && (
    <div className="space-y-4">
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
        <input
          placeholder="Full name"
          className="w-full pl-9 pr-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 outline-none text-sm focus:border-indigo-400/60"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            placeholder="City "
            className="w-full pl-9 pr-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 outline-none text-sm focus:border-indigo-400/60"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="email"
            placeholder="Email "
            className="w-full pl-9 pr-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 outline-none text-sm focus:border-indigo-400/60"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  )}

  <div className="relative">
    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
    <input
      placeholder="Phone number"
      className="w-full pl-9 pr-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 outline-none text-sm focus:border-indigo-400/60"
      value={form.phone}
      onChange={(e) => setForm({ ...form, phone: e.target.value })}
      required
      disabled={isLoading}
    />
  </div>

  <div className="relative">
    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
    <input
      type={showPassword ? "text" : "password"}
      placeholder="Password"
      className="w-full pl-9 pr-9 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 outline-none text-sm focus:border-indigo-400/60"
      value={form.password}
      onChange={(e) => setForm({ ...form, password: e.target.value })}
      required
      disabled={isLoading}
    />
    <button
      type="button"
      onClick={() => setShowPassword((s) => !s)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
      aria-label={showPassword ? "Hide password" : "Show password"}
      disabled={isLoading}
    >
      {showPassword ? (
        <EyeOff className="w-4 h-4" />
      ) : (
        <Eye className="w-4 h-4" />
      )}
    </button>
  </div>

  <button
    type="submit"
    disabled={isLoading}
    className="group w-full py-3 px-4 rounded-xl font-semibold text-sm
               text-white bg-white/10 hover:bg-white/20 border border-white/15
               transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 shadow"
  >
    <span className="flex items-center justify-center">
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
          {mode === "login" ? "Signing in..." : "Creating account..."}
        </>
      ) : (
        <>
          {mode === "login" ? "Access Member Dashboard" : "Start My Membership"}
          <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
        </>
      )}
    </span>
  </button>
</form>


            <div className="mt-4 text-center">
              {mode === "login" ? (
                <button
                  type="button"
                  onClick={() => setModeInUrl("register")}
                  className="text-xs text-white/80 hover:text-white"
                  disabled={isLoading}
                >
                  Create a new membership
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setModeInUrl("login")}
                  className="text-xs text-white/80 hover:text-white"
                  disabled={isLoading}
                >
                  Already a member? Login
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="mt-5 pt-4 border-t border-white/10">
              <p className="text-center text-xs text-white/60">
                By continuing, you agree to our{" "}
                <a href="/terms-services" className="text-white hover:underline font-medium">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy-policy" className="text-white hover:underline font-medium">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>

          <div className="text-center mt-4">
            <p className="text-xs text-white/60">
              Need help?{" "}
              <a href="#" className="text-white hover:underline font-medium">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
