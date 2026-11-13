export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-stone-300 dark:border-carbon-700 bg-white dark:bg-carbon-900 text-emerald-600 shadow-sm focus:ring-emerald-500 ' +
                className
            }
        />
    );
}
