import LoginForm from "@/components/common/auth/LoginForm";
import React from "react";
import { Suspense } from "react";

function LoginSkeleton() {
  return (
    <div className="min-h-screen grid place-items-center">
      <div className="animate-pulse text-gray-600">Loading login…</div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
