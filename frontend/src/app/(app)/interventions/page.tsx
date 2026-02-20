"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { InterventionFilters } from "@/components/interventions/InterventionFilters";
import { InterventionBoard } from "@/components/interventions/InterventionBoard";
import { InterventionCardProps } from "@/components/interventions/InterventionCard";
import { AssignFacultyModal } from "@/components/interventions/AssignFacultyModal";
import { SuccessAnimation } from "@/components/interventions/SuccessAnimation";
import { NewInterventionModal } from "@/components/interventions/NewInterventionModal";
import apiClient from "@/lib/api";

export default function InterventionsPage() {
  const [pending, setPending] = useState<InterventionCardProps[]>([]);
  const [inProgress, setInProgress] = useState<InterventionCardProps[]>([]);
  const [completed, setCompleted] = useState<InterventionCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/analytics/interventions')
      .then((res) => {
        const data = res.data;
        setPending(data.pending || []);
        setInProgress(data.in_progress || []);
        setCompleted(data.completed || []);
      })
      .catch((err) => {
        console.error('Failed to fetch interventions:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isNewInterventionOpen, setIsNewInterventionOpen] = useState(false);
  const [selectedInterventionId, setSelectedInterventionId] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ visible: boolean; teacher: string }>({ visible: false, teacher: "" });

  // -- Handlers --

  const handleCreateIntervention = (intervention: Partial<InterventionCardProps>) => {
    const newCard: InterventionCardProps = {
      id: `new-${Date.now()}`,
      studentName: intervention.studentName || "Unknown",
      studentInitial: intervention.studentInitial || "UK",
      studentId: intervention.studentId || "#0000",
      grade: intervention.grade || "Grade 11",
      riskLevel: intervention.riskLevel || "High Risk",
      alertTitle: intervention.alertTitle || "Manual Alert",
      alertDescription: intervention.alertDescription || "",
      suggestedAction: intervention.suggestedAction || "Review",
      status: "Pending",
    };
    setPending([newCard, ...pending]);
  };

  const handleAssignClick = (id: string) => {
    setSelectedInterventionId(id);
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssignment = (teacherName: string) => {
    if (!selectedInterventionId) return;

    const intervention = pending.find(i => i.id === selectedInterventionId);
    if (intervention) {
      setPending(prev => prev.filter(i => i.id !== selectedInterventionId));

      const updatedIntervention: InterventionCardProps = {
        ...intervention,
        status: "In Progress",
        assignedTo: teacherName,
        actionPlan: "Initial Plan Created",
        actionPlanDescription: "Faculty assigned for immediate follow-up.",
        dueDate: "Pending Meeting"
      };
      setInProgress(prev => [updatedIntervention, ...prev]);
      setSuccessData({ visible: true, teacher: teacherName });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] space-y-4 relative">
      {/* Modals & Overlays */}
      {successData.visible && (
        <SuccessAnimation
          message="Intervention Assigned!"
          subMessage={`Task successfully assigned to ${successData.teacher}`}
          onComplete={() => setSuccessData({ visible: false, teacher: "" })}
        />
      )}

      <AssignFacultyModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onConfirm={handleConfirmAssignment}
        studentName={pending.find(i => i.id === selectedInterventionId)?.studentName || "Student"}
      />

      <NewInterventionModal
        isOpen={isNewInterventionOpen}
        onClose={() => setIsNewInterventionOpen(false)}
        onConfirm={handleCreateIntervention}
      />

      {/* Header */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900">Intervention Board</h2>
          <p className="text-sm font-medium text-gray-500">
            Manage and track student support actions based on risk predictions.
          </p>
        </div>
        <button
          onClick={() => setIsNewInterventionOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          New Intervention
        </button>
      </section>

      {/* Filters */}
      <section>
        <InterventionFilters />
      </section>

      {/* Board */}
      <section className="flex-1 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : (
          <InterventionBoard
            pending={pending}
            inProgress={inProgress}
            completed={completed}
            onAssign={handleAssignClick}
          />
        )}
      </section>
    </div>
  );
}
