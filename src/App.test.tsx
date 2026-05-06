import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { resolveRouterMode } from './utils/routerMode';

jest.mock('./pages/Lobby', () => () => <div>Mock Lobby Page</div>);
jest.mock('./pages/Diagnostics', () => () => <div>Mock Diagnostics Page</div>);
jest.mock('./pages/GameRoom', () => () => <div>Mock Game Room</div>);

describe('App routing', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/');
  });

  test('renders lobby on root route', () => {
    window.history.pushState({}, '', '/');
    render(<App />);

    expect(screen.getByText('Mock Lobby Page')).toBeInTheDocument();
  });

  test('renders diagnostics page on diagnostics route', () => {
    window.history.pushState({}, '', '/diagnostics');
    render(<App />);

    expect(screen.getByText('Mock Diagnostics Page')).toBeInTheDocument();
  });

  test('resolves router mode for browser and github pages hosts', () => {
    expect(resolveRouterMode('localhost:3000')).toBe('BrowserRouter');
    expect(resolveRouterMode('newhandarky.github.io')).toBe('HashRouter');
  });
});
