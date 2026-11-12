import React from 'react';
import Card from './Card';
import Badge from './Badge';

export default function StatCard({
    title,
    value,
    unit,
    subtitle,
    badge,
    badgeVariant = 'foliage',
    icon: Icon,
    iconColor = 'text-emerald-400',
    iconBg = 'bg-carbon-800 text-emerald-400',
    trend,
    className = '',
    ...props
}) {
    return (
        <Card className={`p-6 flex flex-col justify-between ${className}`} {...props}>
            <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                    {badge ? (
                        <Badge variant={badgeVariant} size="sm">
                            {badge}
                        </Badge>
                    ) : (
                        <span />
                    )}
                    {Icon && (
                        <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
                            aria-hidden="true"
                        >
                            <Icon className={`w-5 h-5 ${iconColor}`} />
                        </div>
                    )}
                </div>

                <div className="mb-2">
                    <span className="font-sans font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                        {value}
                    </span>
                    {unit && (
                        <span className="ml-1.5 font-sans text-sm text-stone-400">
                            {unit}
                        </span>
                    )}
                </div>

                <h3 className="font-sans font-medium text-sm text-stone-200 mb-1 leading-snug">
                    {title}
                </h3>
            </div>

            {(subtitle || trend) && (
                <div className="pt-3 mt-3 border-t border-carbon-700/60 flex items-center justify-between gap-2 text-xs text-stone-400">
                    {subtitle && <p className="leading-relaxed">{subtitle}</p>}
                    {trend && (
                        <span className="text-emerald-400 shrink-0 font-medium">
                            {trend}
                        </span>
                    )}
                </div>
            )}
        </Card>
    );
}
