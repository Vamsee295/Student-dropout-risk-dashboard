"use client";

import { useState, useMemo, useEffect } from "react";
import { DirectoryHeader } from "@/components/students/DirectoryHeader";
import { DirectoryFilters } from "@/components/students/DirectoryFilters";
import { StudentTable } from "@/components/students/StudentTable";
import { AssignAdvisorModal } from "@/components/students/AssignAdvisorModal";
import { GroupCounselingModal } from "@/components/students/GroupCounselingModal";
import { exportToCSV } from "@/utils/exportUtils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type DepartmentType = "Computer Science (CSE)" | "Mechanical" | "Aerospace" | "Data Science" | "AI-DS" | "Civil" | "Electronics (ECE)";
type SectionType = "A" | "B" | "C";
type RiskStatusType = "High Risk" | "Moderate Risk" | "Stable" | "Safe";
type RiskTrendType = "up" | "down" | "stable";

interface Student {
  id: string;
  name: string;
  email: string;
  department: DepartmentType;
  course: string;
  section: SectionType;
  year: number;
  riskStatus: RiskStatusType;
  riskScore: number;
  riskTrend: RiskTrendType;
  riskValue: string;
  attendance: number;
  engagementScore: number;
  advisor?: string;
  avatar: string;
  lastInteraction: string;
}

export default function StudentsPage() {
  // State
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedRisk, setSelectedRisk] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<"risk" | "name" | "attendance">("risk");

  // Modal State
  const [isAssignAdvisorOpen, setIsAssignAdvisorOpen] = useState(false);
  const [isGroupCounselingOpen, setIsGroupCounselingOpen] = useState(false);

  // Fetch students from API
  useEffect(() => {
    fetchStudents();
  }, []);

  const mapDepartment = (dept: string): DepartmentType => {
    const deptMap: Record<string, DepartmentType> = {
      "CSE": "Computer Science (CSE)",
      "AI-DS": "AI-DS",
      "AEROSPACE": "Aerospace",
      "MECHANICAL": "Mechanical",
      "CIVIL": "Civil",
      "ECE": "Electronics (ECE)",
      "DATA_SCIENCE": "Data Science"
    };
    return deptMap[dept] || "Computer Science (CSE)";
  };

  const mapRiskTrend = (riskScore: number): RiskTrendType => {
    if (riskScore > 70) return "up";
    if (riskScore < 40) return "down";
    return "stable";
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/students/all`);
      const data = await response.json();

      // Transform API data to match our Student interface
      const transformedStudents: Student[] = data.map((s: any) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        department: mapDepartment(s.department),
        course: s.course || `BTech ${s.department}`,
        section: "A" as SectionType,
        year: s.year,
        riskStatus: s.risk_level as RiskStatusType,  // API already returns correct format
        riskScore: s.risk_score || 0,
        riskTrend: mapRiskTrend(s.risk_score || 0),
        riskValue: `${Math.round(s.risk_score || 0)}%`,
        attendance: Math.round(s.attendance || 0), // API returns 0-100 scale already
        engagementScore: Math.round(s.engagementScore || 0), // API returns 0-100 scale already
        advisor: s.advisor || undefined,
        avatar: s.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random`,
        lastInteraction: s.updated_at || new Date().toISOString().split('T')[0]
      }));

      setStudents(transformedStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  // Derived Data (Filtering)
  const filteredStudents = useMemo(() => {
    let filtered = students.filter(student => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id.includes(searchQuery) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = selectedDept ? student.department === selectedDept : true;
      const matchesRisk = selectedRisk ? student.riskStatus === selectedRisk : true;

      return matchesSearch && matchesDept && matchesRisk;
    });

    // Apply sorting
    return filtered.sort((a, b) => {
      if (sortBy === "risk") {
        return b.riskScore - a.riskScore; // High risk first
      } else if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "attendance") {
        return a.attendance - b.attendance; // Low attendance first
      }
      return 0;
    });
  }, [students, searchQuery, selectedDept, selectedRisk, sortBy]);

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

  const handleAssignAdvisor = async (teacherId: string, teacherName: string) => {
    try {
      // Update advisor for selected students via API
      const selectedIds = Array.from(selectedStudentIds);

      // Call API to assign advisor (you'll need to implement this endpoint)
      const response = await fetch(`${API_URL}/api/students/assign-advisor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_ids: selectedIds,
          advisor_name: teacherName
        })
      });

      if (response.ok) {
        // Update local state
        setStudents(prev => prev.map(student => {
          if (selectedStudentIds.has(student.id)) {
            return { ...student, advisor: teacherName };
          }
          return student;
        }));

        setSelectedStudentIds(new Set());
        alert(`✅ Assigned ${teacherName} to ${selectedIds.length} students.`);
      } else {
        alert("Failed to assign advisor. Please try again.");
      }
    } catch (error) {
      console.error("Error assigning advisor:", error);
      alert("Error assigning advisor. Check console for details.");
    }
  };

  const handleGroupCounseling = async (topic: string, date: string, time: string) => {
    try {
      const selectedIds = Array.from(selectedStudentIds);

      // Call API to schedule counseling
      const response = await fetch(`${API_URL}/api/students/schedule-counseling`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_ids: selectedIds,
          topic,
          date,
          time
        })
      });

      if (response.ok) {
        setSelectedStudentIds(new Set());
        alert(`✅ Scheduled "${topic}" for ${selectedIds.length} students on ${date} at ${time}.`);
      } else {
        alert("Failed to schedule counseling. Please try again.");
      }
    } catch (error) {
      console.error("Error scheduling counseling:", error);
      alert("Error scheduling counseling. Check console for details.");
    }
  };

  const handleExport = () => {
    const studentsToExport = selectedStudentIds.size > 0
      ? students.filter(s => selectedStudentIds.has(s.id))
      : filteredStudents;

    const data = studentsToExport.map(s => ({
      "Student Name": s.name,
      "ID": s.id,
      "Email": s.email,
      "Department": s.department,
      "Year": s.year,
      "Risk Status": s.riskStatus,
      "Risk Score": s.riskScore,
      "Attendance": `${s.attendance}%`,
      "Engagement Score": s.engagementScore,
      "Advisor": s.advisor || "Unassigned"
    }));

    exportToCSV(data, "student_directory_export");
  };

  const handleRiskFilterChange = (risk: string) => {
    setSelectedRisk(risk);
    setSortBy("risk"); // Auto-sort by risk when filtering by risk
  };

  // Constant Lists for Dropdowns
  const DEPARTMENTS = Array.from(new Set(students.map(s => s.department)));
  const RISK_LEVELS = ["High Risk", "Moderate Risk", "Low Risk", "Safe"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

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
          onRiskChange={handleRiskFilterChange}
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
