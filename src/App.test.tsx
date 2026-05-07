import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { resolveRouterMode } from './utils/routerMode';

jest.mock('./pages/Lobby', () => () => <div>Mock Lobby Page</div>);
jest.mock('./pages/Diagnostics', () => () => <div>Mock Diagnostics Page</div>);
jest.mock('./pages/GameRoom', () => () => <div>Mock Game Room</div>);
jest.mock('./pages/LineCallback', () => ({ onReturnToLobby }: { onReturnToLobby?: () => void }) => (
  <div>
    Mock Line Callback
    <button type="button" onClick={onReturnToLobby}>Mock Return</button>
  </div>
));

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

  test('renders line callback page from callback query', () => {
    window.history.pushState({}, '', '/?lineCallback=1&code=abc&state=state');
    render(<App />);

    expect(screen.getByText('Mock Line Callback')).toBeInTheDocument();
  });

  test('returns from callback query to lobby without full page reload', async () => {
    window.history.pushState({}, '', '/?lineCallback=1&code=abc&state=state');
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: 'Mock Return' }));

    expect(screen.getByText('Mock Lobby Page')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/');
    expect(window.location.search).toBe('');
  });

  test('resolves router mode for browser and github pages hosts', () => {
    expect(resolveRouterMode('localhost:3000')).toBe('BrowserRouter');
    expect(resolveRouterMode('newhandarky.github.io')).toBe('HashRouter');
  });
});
