"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";

interface QuestionStat {
    label: string;
    solved: number;
    total: number;
    color: string;
}

interface DifficultyLevel {
    solved: number;
    total: number;
}

interface SolvedQuestionsCardProps {
    easy?: DifficultyLevel;
    medium?: DifficultyLevel;
    hard?: DifficultyLevel;
    totalSolved: number;
    totalQuestions: number;
}

export function SolvedQuestionsCard({
    easy = { solved: 41, total: 83 },
    medium = { solved: 29, total: 31 },
    hard = { solved: 4, total: 5 },
    totalSolved = 74,
    totalQuestions = 119
}: SolvedQuestionsCardProps) {
    const data = [
        { name: "Solved", value: totalSolved, fill: "#3b82f6" },
        { name: "Unsolved", value: totalQuestions - totalSolved, fill: "#f3f4f6" },
    ];

    const stats: QuestionStat[] = [
        { label: "Easy", solved: easy.solved, total: easy.total, color: "bg-emerald-500" },
        { label: "Medium", solved: medium.solved, total: medium.total, color: "bg-yellow-400" },
        { label: "Hard", solved: hard.solved, total: hard.total, color: "bg-red-500" },
    ];

    return (
        <div className="h-full rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">Solved Questions</h3>

            <div className="flex items-center gap-8">
                {/* Donut Chart */}
                <div className="h-32 w-32 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={55}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                                <Label
                                    value={`${totalSolved}/${totalQuestions}`}
                                    position="center"
                                    className="text-lg font-bold text-gray-900"
                                    dy={-5}
                                />
                                <Label
                                    value="Questions"
                                    position="center"
                                    className="text-[10px] text-gray-500 font-medium"
                                    dy={10}
                                />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Progress Bars */}
                <div className="flex-1 space-y-4">
                    {stats.map((stat) => (
                        <div key={stat.label}>
                            <div className="flex justify-between text-xs font-medium text-gray-500 mb-1.5">
                                <span>{stat.label}</span>
                                <span className="text-gray-900 font-bold">
                                    {stat.solved}/{stat.total}
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${stat.color}`}
                                    style={{ width: `${stat.total > 0 ? (stat.solved / stat.total) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
