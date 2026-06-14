// SSR entry — optional. Kept minimal; Inertia's SSR is not enabled by default.
import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import ReactDOMServer from 'react-dom/server';

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        resolve: (name) => {
            const pages = import.meta.glob('./Pages/**/*.tsx', { eager: true });
            return (pages[`./Pages/${name}.tsx`] as { default: unknown }).default;
        },
        setup: ({ App, props }) => <App {...props} />,
    }),
);
