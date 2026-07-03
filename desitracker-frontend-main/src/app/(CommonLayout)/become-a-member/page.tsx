// src/app/(CommonLayout)/become-a-member/page.tsx
"use client";

import React, { Suspense } from "react";
import MembersAuthPage from "@/components/shears/members/MembersAuthPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-400">Loading…</div>}>
      <MembersAuthPage />
    </Suspense>
  );
}
