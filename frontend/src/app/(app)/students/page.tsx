"use client";

import { DirectoryHeader } from "@/components/students/DirectoryHeader";
import { DirectoryFilters } from "@/components/students/DirectoryFilters";
import { StudentTable } from "@/components/students/StudentTable";

export default function StudentsPage() {
  return (
    <div className="max-w-[1600px] mx-auto space-y-8 p-1">
      <DirectoryHeader />

      <div className="p-1 space-y-6">
        <DirectoryFilters />
        <StudentTable />
      </div>
    </div>
  );
}
