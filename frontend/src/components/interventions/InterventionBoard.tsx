"use client";

import { InterventionColumn } from "./InterventionColumn";
import { InterventionCard, InterventionCardProps } from "./InterventionCard";

interface InterventionBoardProps {
    pending: InterventionCardProps[];
    inProgress: InterventionCardProps[];
    completed: InterventionCardProps[];
    onAssign: (id: string) => void;
}

export function InterventionBoard({ pending, inProgress, completed, onAssign }: InterventionBoardProps) {
    return (
        <div className="flex gap-6 overflow-x-auto pb-4 h-[calc(100vh-220px)]">
            <InterventionColumn title="Pending Actions" count={pending.length} color="orange">
                {pending.map((card) => (
                    <InterventionCard
                        key={card.id}
                        data={card}
                        onAssign={onAssign}
                    />
                ))}
            </InterventionColumn>

            <InterventionColumn title="In Progress" count={inProgress.length} color="blue">
                {inProgress.map((card) => (
                    <InterventionCard key={card.id} data={card} />
                ))}
            </InterventionColumn>

            <InterventionColumn title="Completed" count={completed.length} color="emerald">
                {completed.map((card) => (
                    <InterventionCard key={card.id} data={card} />
                ))}
            </InterventionColumn>
        </div>
    );
}
