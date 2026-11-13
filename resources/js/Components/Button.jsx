import React from 'react';
import { Link } from '@inertiajs/react';

const VARIANTS = {
    primary:
        'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white border border-emerald-500/50 shadow-sm',
    secondary:
        'bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-800 border border-stone-300 dark:bg-carbon-800 dark:hover:bg-carbon-700 dark:active:bg-carbon-850 dark:text-stone-200 dark:border-carbon-700 shadow-sm',
    terracotta:
        'bg-terracotta-700 hover:bg-terracotta-600 active:bg-terracotta-800 text-stone-50 border border-terracotta-600/50 shadow-sm',
    outline:
        'bg-transparent hover:bg-stone-100 active:bg-stone-200 text-stone-700 hover:text-stone-900 border border-stone-300 dark:hover:bg-carbon-800 dark:active:bg-carbon-850 dark:text-stone-300 dark:hover:text-white dark:border-carbon-700',
    ghost:
        'bg-transparent hover:bg-stone-100 active:bg-stone-200 text-stone-700 hover:text-stone-900 border border-transparent dark:hover:bg-carbon-800 dark:active:bg-carbon-850 dark:text-stone-300 dark:hover:text-white',
};

const SIZES = {
    sm: 'text-xs px-3 py-1.5 min-h-[44px] rounded-xl gap-1.5',
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
