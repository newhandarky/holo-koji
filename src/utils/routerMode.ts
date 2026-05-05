export const resolveRouterMode = (host: string = window.location.host) => (
    host.includes('github.io') ? 'HashRouter' : 'BrowserRouter'
);

export const shouldUseHashRouter = (host: string = window.location.host) => resolveRouterMode(host) === 'HashRouter';
