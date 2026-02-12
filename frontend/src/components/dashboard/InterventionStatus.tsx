"use client";

interface InterventionItemProps {
    label: string;
    percentage: number;
    color: string;
}

function InterventionItem({ label, percentage, color }: InterventionItemProps) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{label}</span>
                <span className={`font-bold ${color.replace('bg-', 'text-')}`}>{percentage}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${color}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

export function InterventionStatus() {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-bold text-gray-900">Intervention Status</h3>

            <div className="space-y-6">
                <InterventionItem
                    label="Counseling Scheduled"
                    percentage={85}
                    color="bg-blue-600"
                />
                <InterventionItem
                    label="Parent Meetings"
                    percentage={42}
                    color="bg-amber-500"
                />
                <InterventionItem
                    label="Remedial Classes" // Adding a third one to fill space if needed, or stick to Figma
                    percentage={64}
                    color="bg-emerald-500"
                />
            </div>
        </div>
    );
}
