"use client";

import { useState } from "react";
import { Download, Share2, MessageSquare, Monitor } from "lucide-react";
import { MyActivityHeatmap } from "@/components/engagement/MyActivityHeatmap";
import { EngagementMetricCards } from "@/components/engagement/EngagementMetricCards";
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const lmsActivityData = [
  { week: 'Week 1', logins: 12, timeSpent: 5.2 },
  { week: 'Week 2', logins: 15, timeSpent: 6.1 },
  { week: 'Week 3', logins: 8, timeSpent: 3.5 },
  { week: 'Week 4', logins: 19, timeSpent: 8.4 },
  { week: 'Week 5', logins: 16, timeSpent: 7.0 },
];

const forumData = [
  { topic: 'Module 1', posts: 12, replies: 24 },
  { topic: 'Module 2', posts: 8, replies: 15 },
  { topic: 'Module 3', posts: 15, replies: 32 },
  { topic: 'Module 4', posts: 5, replies: 9 },
];

export default function StudentEngagementPage() {
    return (
        <div className="space-y-8 relative pb-10">
            {/* Header Section */}
            <section className="flex flex-wrap items-end justify-between gap-4 border-b border-gray-100 pb-6">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">
                        My Engagement & Activity
                    </h2>
                    <p className="text-base text-gray-500 max-w-2xl">
                        Track your digital participation and learning progress.
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 shadow-sm">
                        <span>📅 Fall Semester 2023</span>
                    </div>
                </div>
            </section>

            {/* Metrics Section */}
            <section>
                <EngagementMetricCards />
            </section>

            {/* Digital Footprint Heatmap */}
            <section>
                <MyActivityHeatmap />
            </section>

            {/* Detailed Charts Grid */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LMS Activity Line Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col h-[350px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Monitor size={18} className="text-blue-500" />
                            LMS Login Activity
                        </h3>
                    </div>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lmsActivityData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={-10} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                                <Line type="monotone" name="Logins" dataKey="logins" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                <Line type="monotone" name="Time (hrs)" dataKey="timeSpent" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Forum Participation Bar Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col h-[350px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <MessageSquare size={18} className="text-emerald-500" />
                            Forum Participation
                        </h3>
                    </div>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={forumData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="topic" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={-10} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#f9fafb' }} />
                                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                                <Bar name="Posts Created" dataKey="posts" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                                <Bar name="Replies" dataKey="replies" fill="#6ee7b7" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            {/* Additional Encouragement */}
            <section className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
                <h3 className="font-bold text-indigo-900 mb-2">Improving Your Engagement</h3>
                <p className="text-sm text-indigo-700 mb-4">
                    Students with consistent activity (3+ days a week) are 40% more likely to achieve an A grade.
                    Try to log in everyday to check for announcements and assignments.
                </p>
            </section>
        </div>
    );
}
