import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { Toaster } from 'sonner';

declare global {
    interface Window {
        appName?: string;
    }
    /**
     * Ziggy injects `route()` globally via the `@routes` Blade directive.
     * Typed loosely here; full type-checking is opt-in via Ziggy's `RouteList`.
     */
    function route(
        name: string,
        params?: Record<string, unknown> | string | number,
        absolute?: boolean,
    ): string;
}

const appName = (import.meta as ImportMeta & { env: Record<string, string> }).env?.VITE_APP_NAME ?? 'CrossSwap';

void createInertiaApp({
    title: (title) => (title ? `${title} — ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        createRoot(el).render(
            <StrictMode>
                <App {...props} />
                <Toaster
                    position="bottom-right"
                    richColors
                    closeButton
                    toastOptions={{ duration: 4000 }}
                    theme="dark"
                />
            </StrictMode>,
        );
    },
    progress: {
        color: '#b8f24a',
        showSpinner: false,
    },
});
