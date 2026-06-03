import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

interface RenderWithRouterOptions extends Omit<RenderOptions, 'wrapper'> {
    initialEntries?: string[];
    strict?: boolean;
}

const routerFuture = {
    v7_startTransition: true,
    v7_relativeSplatPath: true
} as const;

export const renderWithRouter = (
    ui: React.ReactElement,
    {
        initialEntries = ['/'],
        strict = true,
        ...renderOptions
    }: RenderWithRouterOptions = {}
) => {
    const tree = (
        <MemoryRouter initialEntries={initialEntries} future={routerFuture}>
            {ui}
        </MemoryRouter>
    );

    return render(strict ? <React.StrictMode>{tree}</React.StrictMode> : tree, renderOptions);
};
