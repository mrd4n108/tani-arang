export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center min-h-[44px] rounded-xl border border-emerald-600 bg-emerald-600 px-4 py-2.5 text-sm font-semibold tracking-wide text-white transition duration-150 ease-in-out hover:bg-emerald-500 focus:bg-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 active:bg-emerald-700 disabled:opacity-50 ${
                    disabled && 'opacity-50 cursor-not-allowed'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
