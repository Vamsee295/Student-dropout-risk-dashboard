"use client";

import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  variant?: "dark" | "light";
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function LogoIcon({ 
  className = "", 
  variant = "light",
  size = 32 
}: { 
  className?: string; 
  variant?: "dark" | "light";
  size?: number;
}) {
  const strokeColor = variant === "dark" ? "#FFFFFF" : "#0F2B48";
  const nodeFill = "#38BDF8";

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Book Outer Outline */}
      <path 
        d="M12 28 C12 28, 28 20, 50 25 C72 20, 88 28, 88 28 L88 78 C88 78, 70 70, 50 75 C30 70, 12 78, 12 78 Z" 
        stroke={strokeColor} 
        strokeWidth="5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="none"
      />
      
      {/* Book Spine Center Line */}
      <line x1="50" y1="25" x2="50" y2="75" stroke={strokeColor} strokeWidth="5" strokeLinecap="round"/>
      
      {/* Left Page Curve Detail */}
      <path 
        d="M18 34 C26 27, 38 28, 47 31 L47 70 C38 67, 26 66, 18 72 Z" 
        stroke={strokeColor} 
        strokeWidth="3" 
        strokeLinejoin="round" 
        fill="none"
      />
            
      {/* Right Page Curve Detail */}
      <path 
        d="M82 34 C74 27, 62 28, 53 31 L53 70 C62 67, 74 66, 82 72 Z" 
        stroke={strokeColor} 
        strokeWidth="3" 
        strokeLinejoin="round" 
        fill="none"
      />

      {/* Neural Network Graph Lines */}
      <line x1="33" y1="42" x2="43" y2="48" stroke={strokeColor} strokeWidth="2.5"/>
      <line x1="33" y1="42" x2="35" y2="58" stroke={strokeColor} strokeWidth="2.5"/>
      <line x1="35" y1="58" x2="44" y2="65" stroke={strokeColor} strokeWidth="2.5"/>
      <line x1="43" y1="48" x2="35" y2="58" stroke={strokeColor} strokeWidth="2.5"/>
      <line x1="43" y1="48" x2="50" y2="54" stroke={strokeColor} strokeWidth="2.5"/>
      <line x1="44" y1="65" x2="50" y2="54" stroke={strokeColor} strokeWidth="2.5"/>

      {/* Neural Network Nodes */}
      <circle cx="33" cy="42" r="3.5" fill={nodeFill} stroke={strokeColor} strokeWidth="1.5"/>
      <circle cx="35" cy="58" r="3.5" fill={nodeFill} stroke={strokeColor} strokeWidth="1.5"/>
      <circle cx="43" cy="48" r="2.5" fill={strokeColor}/>
      <circle cx="44" cy="65" r="2.5" fill={strokeColor}/>

      {/* Upward Growth Arrow */}
      <line x1="46" y1="68" x2="70" y2="40" stroke={strokeColor} strokeWidth="4.5" strokeLinecap="round"/>
      <polygon points="73,36 60,39 67,46" fill={strokeColor}/>
    </svg>
  );
}

export function Logo({ 
  className = "", 
  variant = "light", 
  showText = true,
  size = "md",
  href
}: LogoProps) {
  const iconSize = size === "sm" ? 24 : size === "lg" ? 40 : 32;
  const textSize = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-xl";

  const content = (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div className="flex items-center justify-center shrink-0">
        <LogoIcon variant={variant} size={iconSize} />
      </div>

      {showText && (
        <span className={`font-bold tracking-tight ${textSize} ${variant === "dark" ? "text-white" : "text-[#0F2B48]"}`}>
          EduRisk <span className={variant === "dark" ? "text-[#38BDF8]" : "text-[#0F2B48]"}>AI</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="inline-block transition-opacity hover:opacity-90">{content}</Link>;
  }

  return content;
}
