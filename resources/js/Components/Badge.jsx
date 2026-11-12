import React from 'react';

const VARIANTS = {
    foliage: 'bg-emerald-950/70 text-emerald-300',
    harvest: 'bg-amber-950/70 text-amber-300',
    terracotta: 'bg-orange-950/70 text-orange-300',
    carbon: 'bg-carbon-800 text-stone-300',
    soil: 'bg-stone-800 text-stone-300',
    outline: 'bg-carbon-800/60 text-stone-300',
};

const DOT_COLORS = {
    foliage: 'bg-emerald-400',
    harvest: 'bg-amber-400',
    terracotta: 'bg-orange-400',
    carbon: 'bg-stone-400',
    soil: 'bg-stone-400',
    outline: 'bg-stone-400',
};

const SIZES = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-1.5',
};

export default function Badge({
    children,
    variant = 'foliage',
    size = 'md',
    dot = false,
    className = '',
    ...props
}) {
    const variantStyle = VARIANTS[variant] || VARIANTS.foliage;
    const dotColor = DOT_COLORS[variant] || DOT_COLORS.foliage;
    const sizeStyle = SIZES[size] || SIZES.md;

    return (
        <span
            className={`inline-flex items-center font-sans font-medium rounded-full select-none ${variantStyle} ${sizeStyle} ${className}`}
            {...props}
        >
            {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
            {children}
        </span>
    );
}
