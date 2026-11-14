import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Global safe route() fallback in case Ziggy (@routes) is absent or blocked
const STATIC_ROUTES = {
    'login': '/login',
    'logout': '/logout',
    'register': '/register',
    'password.request': '/forgot-password',
    'password.email': '/forgot-password',
    'password.reset': '/reset-password',
    'password.store': '/reset-password',
    'password.confirm': '/confirm-password',
    'verification.send': '/email/verification-notification',
    'dashboard': '/',
    'scanner': '/scanner',
    'scanner.analyze': '/scanner/analyze',
    'scanner.store': '/scanner/store',
    'community-map': '/community-map',
    'facts': '/facts',
    'contact': '/contact',
    'profile.edit': '/profile',
    'profile.update': '/profile',
    'profile.destroy': '/profile',
};

if (typeof window !== 'undefined') {
    const existingRoute = window.route;
    window.route = function (name, params) {
        if (typeof existingRoute === 'function') {
            try {
                return existingRoute(name, params);
            } catch (e) {}
        }
        return STATIC_ROUTES[name] || (name ? `/${name.replace('.', '/')}` : '/');
    };
    window.route.current = function (name) {
        if (typeof existingRoute === 'function' && typeof existingRoute.current === 'function') {
            try {
                return existingRoute.current(name);
            } catch (e) {}
        }
        if (typeof window.location !== 'undefined' && name) {
            const expected = STATIC_ROUTES[name];
            return expected ? window.location.pathname === expected : false;
        }
        return false;
    };
}
