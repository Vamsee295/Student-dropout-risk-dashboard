"use client";

import React, { useEffect, useRef } from "react";

const CinematicBackground: React.FC = () => {
    const mousePosition = useRef({ x: 0, y: 0 });
    const bgRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mousePosition.current = {
                x: e.clientX / window.innerWidth,
                y: e.clientY / window.innerHeight,
            };
        };

        window.addEventListener("mousemove", handleMouseMove);

        let animationFrameId: number;

        const animate = () => {
            if (bgRef.current) {
                const x = (mousePosition.current.x - 0.5) * 20; // 20px movement range
                const y = (mousePosition.current.y - 0.5) * 20;

                // Smooth interpolation could be added here for even smoother feel, 
                // but CSS transitions on the transform property work well for this subtle effect.
                bgRef.current.style.transform = `translate(${x}px, ${y}px)`;
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="fixed inset-0 -z-50 overflow-hidden bg-charcoal-900 pointer-events-none">
            {/* Base Gradient Layer */}
            <div
                className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_50%,_rgba(25,25,30,1)_0%,_rgba(5,5,10,1)_100%)]"
            />

            {/* Animated Glow Orbs - wrapped in a container for parallax */}
            <div ref={bgRef} className="absolute inset-0 transition-transform duration-1000 ease-out will-change-transform">
                {/* Top Left Glow */}
                <div
                    className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-white/[0.03] blur-[120px] animate-float-slow"
                />

                {/* Bottom Right Glow */}
                <div
                    className="absolute -bottom-[10%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-white/[0.02] blur-[100px] animate-float-medium"
                />

                {/* Center Pulse */}
                <div
                    className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] rounded-full bg-white/[0.015] blur-[80px] animate-pulse-slow"
                />
            </div>

            {/* Noise/Grain Overlay (Optional for texture) */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            ></div>

            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)] pointer-events-none"></div>

        </div>
    );
};

export default CinematicBackground;
