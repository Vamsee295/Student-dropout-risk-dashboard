"use client";

import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface SuccessAnimationProps {
    message: string;
    subMessage?: string;
    onComplete?: () => void;
}

export function SuccessAnimation({ message, subMessage, onComplete }: SuccessAnimationProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onComplete) onComplete();
        }, 2000); // Show for 2 seconds

        return () => clearTimeout(timer);
    }, [onComplete]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="flex flex-col items-center justify-center text-center p-8 scale-100 animate-in zoom-in-95 duration-300">
                <div className="h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle className="h-12 w-12 text-emerald-600" strokeWidth={3} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{message}</h2>
                {subMessage && <p className="text-gray-500">{subMessage}</p>}
            </div>
        </div>
    );
}
