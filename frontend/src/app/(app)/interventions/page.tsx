"use client";

import { Plus } from "lucide-react";
import { InterventionFilters } from "@/components/interventions/InterventionFilters";
import { InterventionBoard } from "@/components/interventions/InterventionBoard";

export default function InterventionsPage() {
  return (
    <div className="flex h-full flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Intervention Board
          </h1>
          <p className="text-sm text-slate-500">
            Manage and track student support actions based on risk predictions.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 shadow-sm transition-colors">
          <Plus size={18} />
          New Intervention
        </button>
      </div>

      {/* Filters */}
      <InterventionFilters />

      {/* Board (Scrollable if needed) */}
      <div className="flex-1 overflow-x-auto pb-4">
        <InterventionBoard />
      </div>
    </div>
  );
}
