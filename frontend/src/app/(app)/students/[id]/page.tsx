"use client";

import { ChevronLeft, User, Search } from "lucide-react";
import Link from "next/link";
import { AssessmentStatCard } from "@/components/students/details/AssessmentStatCard";
import { SolvedQuestionsChart } from "@/components/students/details/SolvedQuestionsChart";
import { DomainPerformanceCard } from "@/components/students/details/DomainPerformanceCard";

export default function StudentDetailsPage({ params }: { params: { id: string } }) {
  // In a real app, fetch data based on params.id

  return (
    <div className="flex flex-col gap-6">
      {/* Header with Breadcrumb and Student Profile Summary Card */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Cover Image Placeholder */}
        <div className="h-24 w-full bg-gradient-to-r from-pink-200 via-orange-100 to-amber-100"></div>

        <div className="flex flex-col gap-4 px-6 pb-6 md:flex-row md:items-end">
          {/* Avatar */}
          <div className="-mt-12 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-white shadow-sm">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <User size={40} />
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900">Vamsee Krishna Vemulapalli</h1>
            <p className="text-xs text-slate-500">2300033830cseh@gmail.com</p>
            <div className="mt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1">
                <span className="text-slate-400">Register Number:</span> 2300033830
              </span>
              <div className="h-4 w-px bg-slate-200"></div>
              <span className="flex items-center gap-1">
                <span className="text-slate-400">Degree:</span> B.TECH - CSE
              </span>
              <div className="h-4 w-px bg-slate-200"></div>
              <span className="flex items-center gap-1">
                <span className="text-slate-400">Batch:</span> 2027
              </span>
              <div className="h-4 w-px bg-slate-200"></div>
              <span className="flex items-center gap-1">
                <span className="text-slate-400">College:</span> K L University
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Row: General Assessments */}
      <div className="grid gap-6 md:grid-cols-3">
        <AssessmentStatCard
          title="Neo-PAT"
          score={379}
          level={1}
        />
        <AssessmentStatCard
          title="Neo-Colab"
          subtext="No Colab Courses Taken"
        />
        <SolvedQuestionsChart />
      </div>

      {/* Bottom Row: Detailed Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <DomainPerformanceCard
          title="Coding"
          metrics={[
            { label: "Questions Attended", value: 39 },
            { label: "Solved Correctly", value: 37 },
          ]}
          score={379}
          accuracy={97.05}
        />
        <DomainPerformanceCard
          title="Projects"
          metrics={[
            { label: "Major Attended", value: 0 },
            { label: "Minor Attended", value: 0 },
          ]}
          score={0}
        // No accuracy for projects in design
        />
        <DomainPerformanceCard
          title="MCQ"
          metrics={[
            { label: "Questions Attended", value: 80 },
            { label: "Solved Correctly", value: 37 },
          ]}
          score={37}
          accuracy={46.25}
        />
      </div>
    </div>
  );
}
