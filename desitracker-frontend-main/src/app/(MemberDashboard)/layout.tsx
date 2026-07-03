// src/app/(MemberDashboard)/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

export default async function MemberDashboardLayout({
  children,
}: { children: React.ReactNode }) {
  // read cookie on the server (async API)
  const cookieStore = await cookies();
  const token = cookieStore.get("desiTrackerToken")?.value;

  if (!token) {
    redirect(`/members?next=${encodeURIComponent("/members/dashboard")}`);
  }

  return <>{children}</>;
}
