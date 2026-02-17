"use client";

import React from "react";

interface LogoProps {
    className?: string;
    variant?: "dark" | "light";
    showText?: boolean;
}

export function Logo({ className = "", variant = "dark", showText = true }: LogoProps) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Logo Icon: Rounded white square with bar chart icon */}
            <div className="relative w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-gray-100/10">
                <div className="flex items-end gap-[3px]">
                    <div className="w-[6px] h-5 bg-gray-900 rounded-sm"></div>
                    <div className="w-[6px] h-3 bg-gray-900 rounded-sm"></div>
                </div>
            </div>

            {showText && (
                <span className={`font-bold text-xl tracking-tight ${variant === "dark" ? "text-white" : "text-gray-900"}`}>
                    EduRisk AI
                </span>
            )}
        </div>
    );
}
