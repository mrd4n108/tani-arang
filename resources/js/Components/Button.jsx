import React from 'react';
import { Link } from '@inertiajs/react';

const VARIANTS = {
    primary:
        'bg-foliage-700 hover:bg-foliage-600 active:bg-foliage-800 text-stone-50 border border-foliage-600/50 shadow-sm',
    secondary:
        'bg-carbon-800 hover:bg-carbon-700 active:bg-carbon-850 text-stone-200 border border-carbon-700 shadow-sm',
    terracotta:
        'bg-terracotta-700 hover:bg-terracotta-600 active:bg-terracotta-800 text-stone-50 border border-terracotta-600/50 shadow-sm',
    outline:
        'bg-transparent hover:bg-carbon-800 active:bg-carbon-850 text-stone-300 hover:text-white border border-carbon-700',
    ghost:
        'bg-transparent hover:bg-carbon-800 active:bg-carbon-850 text-stone-300 hover:text-white border border-transparent',
};

const SIZES = {
    sm: 'text-xs px-3 py-1.5 min-h-[44px] sm:min-h-[38px] rounded-xl gap-1.5',
    md: 'text-sm px-4 py-2 min-h-[44px] rounded-xl gap-2 font-medium',
    lg: 'text-base px-5 py-2.5 min-h-[48px] rounded-2xl gap-2.5 font-semibold',
};

export default function Button({
    children,
    as: Component = 'button',
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    type = 'button',
    href,
    ...props
}) {
    const variantClasses = VARIANTS[variant] || VARIANTS.primary;
    const sizeClasses = SIZES[size] || SIZES.md;
    const baseClasses =
        'inline-flex items-center justify-center transition-colors select-none font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foliage-500 focus-visible:ring-offset-2 focus-visible:ring-offset-carbon-900';
    const disabledClasses = disabled
        ? 'opacity-50 cursor-not-allowed pointer-events-none'
        : 'cursor-pointer';

    const combinedClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${disabledClasses} ${className}`;

    if (Component === 'a' || Component === Link || href) {
        const LinkComponent = Component === 'button' ? Link : Component;
        return (
            <LinkComponent
                href={href}
                className={combinedClasses}
                aria-disabled={disabled}
                {...props}
            >
                {children}
            </LinkComponent>
        );
    }

    return (
        <button
            type={type}
            disabled={disabled}
            className={combinedClasses}
            {...props}
        >
            {children}
        </button>
    );
}
