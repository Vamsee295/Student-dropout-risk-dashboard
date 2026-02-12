"use client";

import { useState, useMemo } from "react";
import { DirectoryHeader } from "@/components/students/DirectoryHeader";
import { DirectoryFilters } from "@/components/students/DirectoryFilters";
import { StudentTable } from "@/components/students/StudentTable";
import { AssignAdvisorModal } from "@/components/students/AssignAdvisorModal";
import { GroupCounselingModal } from "@/components/students/GroupCounselingModal";
import { STUDENTS, Student } from "@/data/mockStudentData";
import { exportToCSV } from "@/utils/exportUtils";

export default function StudentsPage() {
  // State
  const [students, setStudents] = useState<Student[]>(STUDENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedRisk, setSelectedRisk] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  // Modal State
  const [isAssignAdvisorOpen, setIsAssignAdvisorOpen] = useState(false);
  const [isGroupCounselingOpen, setIsGroupCounselingOpen] = useState(false);

  // Derived Data (Filtering)
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id.includes(searchQuery);
      const matchesDept = selectedDept ? student.department === selectedDept : true;
      const matchesRisk = selectedRisk ? student.riskStatus === selectedRisk : true;

      return matchesSearch && matchesDept && matchesRisk;
    });
  }, [students, searchQuery, selectedDept, selectedRisk]);

  // Counts for Tabs
  const counts = useMemo(() => ({
    all: students.length,
    high: students.filter(s => s.riskStatus === "High Risk").length,
    moderate: students.filter(s => s.riskStatus === "Moderate Risk").length
  }), [students]);

  // Handlers
  const handleToggleSelection = (id: string) => {
    const newSet = new Set(selectedStudentIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedStudentIds(newSet);
  };

  const handleToggleAll = () => {
    if (selectedStudentIds.size === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(filteredStudents.map(s => s.id)));
    }
  };

  const handleAssignAdvisor = (teacherId: string, teacherName: string) => {
    setStudents(prev => prev.map(student => {
      if (selectedStudentIds.has(student.id)) {
        return { ...student, advisor: teacherName };
      }
      return student;
    }));
    setSelectedStudentIds(new Set()); // Clear selection
    // In a real app, we'd show a toast here
    alert(`Assigned ${teacherName} to ${selectedStudentIds.size} students.`);
  };

  const handleGroupCounseling = (topic: string, date: string, time: string) => {
    // Mock API call
    console.log(`Scheduled "${topic}" on ${date} at ${time} for ${selectedStudentIds.size} students.`);
    setSelectedStudentIds(new Set()); // Clear selection
    alert(`Scheduled "${topic}" for ${selectedStudentIds.size} students on ${date}.`);
  };



  const handleExport = () => {
    const studentsToExport = selectedStudentIds.size > 0
      ? students.filter(s => selectedStudentIds.has(s.id))
      : filteredStudents;

    const data = studentsToExport.map(s => ({
      "Student Name": s.name,
      "ID": s.id,
      "Department": s.department,
      "Risk Status": s.riskStatus,
      "Attendance": `${s.attendance}%`,
      "Engagement Score": s.engagementScore,
      "Advisor": s.advisor || "None"
    }));

    exportToCSV(data, "student_directory_export");
  };

  // Constant Lists for Dropdowns
  const DEPARTMENTS = Array.from(new Set(STUDENTS.map(s => s.department)));
  const RISK_LEVELS = ["High Risk", "Moderate Risk", "Stable", "Safe"];

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 p-1">
      <DirectoryHeader
        selectedCount={selectedStudentIds.size}
        onAssignAdvisor={() => setIsAssignAdvisorOpen(true)}
        onGroupCounseling={() => setIsGroupCounselingOpen(true)}
        onExport={handleExport}
      />

      <div className="p-1 space-y-6">
        <DirectoryFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          departments={DEPARTMENTS}
          selectedDept={selectedDept}
          onDeptChange={setSelectedDept}
          riskLevels={RISK_LEVELS}
          selectedRisk={selectedRisk}
          onRiskChange={setSelectedRisk}
          onClear={() => {
            setSearchQuery("");
            setSelectedDept("");
            setSelectedRisk("");
          }}
          counts={counts}
        />

        <StudentTable
          students={filteredStudents}
          selectedIds={selectedStudentIds}
          onToggleSelection={handleToggleSelection}
          onToggleAll={handleToggleAll}
        />
      </div>

      {/* Modals */}
      <AssignAdvisorModal
        isOpen={isAssignAdvisorOpen}
        onClose={() => setIsAssignAdvisorOpen(false)}
        onConfirm={handleAssignAdvisor}
        studentCount={selectedStudentIds.size}
      />

      <GroupCounselingModal
        isOpen={isGroupCounselingOpen}
        onClose={() => setIsGroupCounselingOpen(false)}
        onConfirm={handleGroupCounseling}
        studentCount={selectedStudentIds.size}
      />
    </div>
  );
}
