import React, { useState, useRef } from 'react';

export default function Interactive3DCard({
    children,
    className = '',
    glowColor = 'rgba(16, 185, 129, 0.24)',
    intensity = 10,
}) {
    const cardRef = useRef(null);
    const [transformStyle, setTransformStyle] = useState(
        'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
    );
    const [glareStyle, setGlareStyle] = useState({
        opacity: 0,
        background: 'radial-gradient(circle at 50% 50%, rgba(16,185,129,0.2), transparent 70%)',
    });

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (((y - centerY) / centerY) * -intensity).toFixed(2);
        const rotateY = (((x - centerX) / centerX) * intensity).toFixed(2);

        setTransformStyle(
            `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`
        );

        const percentX = Math.round((x / rect.width) * 100);
        const percentY = Math.round((y / rect.height) * 100);

        setGlareStyle({
            opacity: 1,
            background: `radial-gradient(circle at ${percentX}% ${percentY}%, ${glowColor}, transparent 65%)`,
        });
    };

    const handleMouseLeave = () => {
        setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
        setGlareStyle((prev) => ({ ...prev, opacity: 0 }));
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                transform: transformStyle,
                transition: 'transform 180ms cubic-bezier(0.03, 0.98, 0.52, 0.99)',
                transformStyle: 'preserve-3d',
            }}
            className={`glass-panel rounded-2xl overflow-hidden ${className}`}
        >
            {/* Dynamic Cursor Glare Layer */}
            <div
                style={{
                    ...glareStyle,
                    transition: 'opacity 300ms ease',
                }}
                className="pointer-events-none absolute inset-0 z-0"
            />

            {/* Elevated 3D Inner Content */}
            <div className="relative z-10 h-full" style={{ transform: 'translateZ(20px)' }}>
                {children}
            </div>
        </div>
    );
}