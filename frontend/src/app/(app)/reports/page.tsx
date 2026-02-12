"use client";

import { ReportsHeader } from "@/components/reports/ReportsHeader";
import { ReportsTable } from "@/components/reports/ReportsTable";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <ReportsHeader />
      <div className="px-8 pb-8">
        <ReportsTable />
      </div>
    </div>
  );
}
