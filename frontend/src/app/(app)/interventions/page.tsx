"use client";

import { Plus } from "lucide-react";
import { InterventionFilters } from "@/components/interventions/InterventionFilters";
import { InterventionBoard } from "@/components/interventions/InterventionBoard";

export default function InterventionsPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-80px)] space-y-4">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900">Intervention Board</h2>
          <p className="text-sm font-medium text-gray-500">
            Manage and track student support actions based on risk predictions.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
          <Plus size={16} />
          New Intervention
        </button>
      </section>

      <section>
        <InterventionFilters />
      </section>

      <section className="flex-1 min-h-0">
        <InterventionBoard />
      </section>
    </div>
  );
}
