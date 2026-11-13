import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'min-h-[44px] rounded-xl border-stone-300 dark:border-carbon-700 bg-white dark:bg-carbon-900 text-stone-900 dark:text-stone-100 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 px-3.5 py-2 text-sm transition-colors ' +
                className
            }
            ref={localRef}
        />
    );
});
