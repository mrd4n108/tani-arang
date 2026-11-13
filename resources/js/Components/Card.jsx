import React from 'react';

export function Card({
    children,
    className = '',
    intensity,
    glowColor,
    ...props
}) {
    return (
        <div
            className={`bg-white dark:bg-carbon-850 border border-stone-200 dark:border-carbon-700/60 rounded-2xl text-stone-900 dark:text-stone-100 shadow-sm transition-colors ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '', ...props }) {
    return (
        <div className={`p-5 sm:p-6 pb-2 flex flex-col space-y-1.5 ${className}`} {...props}>
            {children}
        </div>
    );
}

export function CardTitle({ children, className = '', as: Component = 'h3', ...props }) {
    return (
        <Component
            className={`font-sans font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100 tracking-tight ${className}`}
            {...props}
        >
            {children}
        </Component>
    );
}

export function CardDescription({ children, className = '', ...props }) {
    return (
        <p className={`text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed ${className}`} {...props}>
            {children}
        </p>
    );
}

export function CardContent({ children, className = '', ...props }) {
    return (
        <div className={`p-5 sm:p-6 pt-2 ${className}`} {...props}>
            {children}
        </div>
    );
}

export function CardFooter({ children, className = '', ...props }) {
    return (
        <div className={`p-5 sm:p-6 pt-0 flex items-center justify-between gap-3 ${className}`} {...props}>
            {children}
        </div>
    );
}

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
