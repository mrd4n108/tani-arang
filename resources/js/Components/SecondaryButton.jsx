export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center justify-center min-h-[44px] rounded-xl border border-stone-300 dark:border-carbon-700 bg-white dark:bg-carbon-800 px-4 py-2.5 text-sm font-semibold tracking-wide text-stone-700 dark:text-stone-200 shadow-sm transition duration-150 ease-in-out hover:bg-stone-50 dark:hover:bg-carbon-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-50 ${
                    disabled && 'opacity-50 cursor-not-allowed'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
