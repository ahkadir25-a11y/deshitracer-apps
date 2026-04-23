import type { ReactNode } from "react";
import RotaNavTabs from "@/components/profile-components/rota/RotaNavTabs";

export default function RotaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full">
      <div className=" px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Rota</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage roles, employees, and weekly schedules.
              </p>
            </div>
            <div className="text-xs text-gray-500">
              Tip: Create roles → add employees → assign shifts.
            </div>
          </div>

          <div className="mt-5">
            <RotaNavTabs />
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
