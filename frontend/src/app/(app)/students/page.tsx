"use client";

import { DirectoryHeader } from "@/components/students/DirectoryHeader";
import { DirectoryFilters } from "@/components/students/DirectoryFilters";
import { StudentTable } from "@/components/students/StudentTable";

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <DirectoryHeader />
      <div className="space-y-6">
        <DirectoryFilters />
        <StudentTable />
      </div>
    </div>
  );
}

