"use client";

import { Star, GraduationCap, Globe } from "lucide-react";
import React, { useState } from "react";

export function ProfileCard() {
    const [isPublic, setIsPublic] = useState(true);

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
                <div className="flex gap-4">
                    <div className="relative h-24 w-24 overflow-hidden rounded-lg border-2 border-amber-400 bg-slate-100 p-1">
                        {/* Placeholder Avatar */}
                        <div className="flex h-full w-full items-center justify-center rounded bg-slate-200 text-slate-400">
                            <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                        <div className="absolute right-0 top-0 text-amber-500">
                            <Star size={16} fill="currentColor" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Vamsee Krishna Vemulapalli
                        </h2>
                        <p className="text-sm font-medium text-slate-500">(Vamsee05)</p>

                        <div className="mt-3 space-y-1">
                            <div className="flex items-center gap-2 text-sm font-bold text-blue-600">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                                Overall Score: 16300
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-amber-600">
                                <Globe size={16} />
                                Global Rank: 13856
                            </div>
                        </div>
                    </div>
                </div>

                {/* Toggle Switch */}
                <button
                    onClick={() => setIsPublic(!isPublic)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublic ? "bg-amber-400" : "bg-slate-200"}`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublic ? "translate-x-6" : "translate-x-1"}`} />
                </button>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4">
                <h3 className="mb-2 text-sm font-semibold text-slate-500">Recent Education</h3>
                <div className="flex items-start gap-2">
                    <GraduationCap size={18} className="mt-0.5 text-slate-900" />
                    <span className="text-sm font-bold text-slate-900">Bachelor of Technology (BTech) | (KLU) KL University</span>
                </div>
            </div>
        </div>
    );
}
