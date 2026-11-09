import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Cpu, Leaf } from 'lucide-react';

export default function Biochar3DMoleculeHero() {
    const [rotation, setRotation] = useState({ x: -12, y: 18 });

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;
        setRotation({
            x: (-12 - relY * 32).toFixed(1),
            y: (18 + relX * 42).toFixed(1),
        });
    };

    const resetRotation = () => setRotation({ x: -12, y: 18 });

    return (
        <div
            onMouseMove={handleMouseMove}
            onMouseLeave={resetRotation}
            className="relative w-full h-[380px] sm:h-[420px] rounded-3xl glass-panel p-6 flex flex-col justify-between overflow-hidden select-none cursor-grab active:cursor-grabbing group"
        >
            {/* Background Ambient Bioluminescent Aura */}
            <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/20 blur-3xl animate-pulse-glow" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-cyan-500/15 blur-3xl animate-pulse-glow" />

            {/* Top Telemetry Header */}
            <div className="relative z-20 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-xs font-mono text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    3D BIOCHAR CARBON-MATRIX v2.6
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                    GERAKKAN KURSOR (3D INTERAKTIF)
                </span>
            </div>

            {/* Center 3D Rotating Molecular Lattice & Isometric Terraced Soil */}
            <div className="relative z-10 flex-1 flex items-center justify-center my-2">
                <div
                    style={{
                        transform: `perspective(900px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                        transformStyle: 'preserve-3d',
                        transition: 'transform 140ms ease-out',
                    }}
                    className="relative w-64 h-64 flex items-center justify-center"
                >
                    {/* Outer Orbital Ring 1 */}
                    <div
                        style={{ transform: 'translateZ(15px) rotateX(65deg)' }}
                        className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-400/40 animate-spin-slow"
                    />
                    {/* Outer Orbital Ring 2 */}
                    <div
                        style={{ transform: 'translateZ(-15px) rotateY(65deg)' }}
                        className="absolute inset-4 rounded-full border border-cyan-400/40 animate-spin-slow"
                    />

                    {/* Central Hexagonal Carbon Crystal SVG */}
                    <div
                        style={{ transform: 'translateZ(38px)' }}
                        className="relative w-44 h-44 rounded-3xl bg-slate-950/80 border border-emerald-400/50 shadow-[0_0_50px_rgba(16,185,129,0.35)] flex flex-col items-center justify-center p-4"
                    >
                        <svg viewBox="0 0 120 120" className="w-28 h-28 drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]">
                            <defs>
                                <linearGradient id="carbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#10B981" />
                                    <stop offset="50%" stopColor="#06B6D4" />
                                    <stop offset="100%" stopColor="#F59E0B" />
                                </linearGradient>
                            </defs>
                            {/* Hexagonal Graphene-Biochar Lattice */}
                            <polygon
                                points="60,10 103,35 103,85 60,110 17,85 17,35"
                                fill="rgba(16, 185, 129, 0.12)"
                                stroke="url(#carbonGrad)"
                                strokeWidth="2.5"
                            />
                            <polygon
                                points="60,26 89,43 89,77 60,94 31,77 31,43"
                                fill="rgba(6, 182, 212, 0.12)"
                                stroke="#10B981"
                                strokeWidth="1.5"
                                strokeDasharray="4 2"
                            />
                            {/* Internal Carbon Bonds */}
                            <line x1="60" y1="10" x2="60" y2="26" stroke="#10B981" strokeWidth="2" />
                            <line x1="103" y1="35" x2="89" y2="43" stroke="#06B6D4" strokeWidth="2" />
                            <line x1="103" y1="85" x2="89" y2="77" stroke="#10B981" strokeWidth="2" />
                            <line x1="60" y1="110" x2="60" y2="94" stroke="#F59E0B" strokeWidth="2" />
                            <line x1="17" y1="85" x2="31" y2="77" stroke="#06B6D4" strokeWidth="2" />
                            <line x1="17" y1="35" x2="31" y2="43" stroke="#10B981" strokeWidth="2" />
                            {/* Glowing Nodes */}
                            <circle cx="60" cy="10" r="4.5" fill="#10B981" />
                            <circle cx="103" cy="35" r="4.5" fill="#06B6D4" />
                            <circle cx="103" cy="85" r="4.5" fill="#10B981" />
                            <circle cx="60" cy="110" r="4.5" fill="#F59E0B" />
                            <circle cx="17" cy="85" r="4.5" fill="#06B6D4" />
                            <circle cx="17" cy="35" r="4.5" fill="#10B981" />
                            <circle cx="60" cy="60" r="8" fill="url(#carbonGrad)" />
                        </svg>
                        <span className="mt-1 font-mono text-[11px] text-emerald-300 tracking-wider font-semibold">
                            C-POROUS MATRIX
                        </span>
                    </div>

                    {/* Floating 3D Satellite Pills */}
                    <div
                        style={{ transform: 'translateZ(65px) translate(-95px, -68px)' }}
                        className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-emerald-400/50 text-[11px] font-mono text-emerald-300 shadow-lg"
                    >
                        KTK Tanah +38%
                    </div>
                    <div
                        style={{ transform: 'translateZ(55px) translate(90px, -50px)' }}
                        className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-cyan-400/50 text-[11px] font-mono text-cyan-300 shadow-lg"
                    >
                        Retensi Air 4.8x
                    </div>
                    <div
                        style={{ transform: 'translateZ(70px) translate(82px, 68px)' }}
                        className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-amber-400/50 text-[11px] font-mono text-amber-300 shadow-lg"
                    >
                        Zero PM2.5 Burn
                    </div>
                </div>
            </div>

            {/* Bottom Live Telemetry Footer */}
            <div className="relative z-20 grid grid-cols-3 gap-2 pt-3 border-t border-emerald-500/20 text-center">
                <div className="bg-slate-950/50 rounded-xl p-2 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400">ROTASI 3D</div>
                    <div className="text-xs font-mono text-emerald-300">
                        X:{rotation.x}° Y:{rotation.y}°
                    </div>
                </div>
                <div className="bg-slate-950/50 rounded-xl p-2 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400">STABILITAS C</div>
                    <div className="text-xs font-mono text-cyan-300">&gt;100 Tahun</div>
                </div>
                <div className="bg-slate-950/50 rounded-xl p-2 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400">AI ENGINE</div>
                    <div className="text-xs font-mono text-amber-300">Gemini 2.5</div>
                </div>
            </div>
        </div>
    );
}