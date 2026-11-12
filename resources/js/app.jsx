import './bootstrap';
import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = import.meta.env.VITE_APP_NAME || 'TaniArang';

function getInitialPage() {
    if (typeof window === 'undefined') return undefined;
    const script = document.querySelector('script[data-page="app"]');
    if (script && script.textContent) {
        try {
            return JSON.parse(script.textContent);
        } catch (e) {}
    }
    const el = document.getElementById('app');
    if (el?.dataset?.page) {
        try {
            return JSON.parse(el.dataset.page);
        } catch (e) {}
    }
    return undefined;
}

const initialPage = getInitialPage();

if (typeof document !== 'undefined') {
    const el = document.getElementById('app');
    const script = document.querySelector('script[data-page="app"]');
    if (el && !el.dataset.page && script && script.textContent) {
        el.dataset.page = script.textContent;
    }
}

createInertiaApp({
    page: initialPage,
    title: (title) => `${title} | ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx')
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props}/>);
    },
    progress: {
        color: '#10B981',
        showSpinner: true,
    },
});