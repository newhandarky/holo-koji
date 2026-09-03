import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import config from './config/environment';
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
  const originalWebAppUrl = config.webAppUrl;

  afterEach(() => {
    window.history.pushState({}, '', '/');
    config.webAppUrl = originalWebAppUrl;
    delete window.liff;
  });

  test('renders lobby on root route', () => {
    window.history.pushState({}, '', '/');
    render(<App />);

    expect(screen.getByText('Mock Lobby Page')).toBeInTheDocument();
  });

  test('renders diagnostics page on diagnostics route', async () => {
    window.history.pushState({}, '', '/diagnostics');
    render(<App />);

    expect(screen.getByRole('status')).toHaveTextContent('頁面載入中…');
    expect(await screen.findByText('Mock Diagnostics Page')).toBeInTheDocument();
  });

  test('renders line callback page from callback query', async () => {
    window.history.pushState({}, '', '/?lineCallback=1&code=abc&state=state');
    render(<App />);

    expect(await screen.findByText('Mock Line Callback')).toBeInTheDocument();
  });

  test('does not initialize LIFF on line login callback query', async () => {
    config.webAppUrl = window.location.origin;
    const init = jest.fn().mockResolvedValue(undefined);
    window.liff = { init };

    window.history.pushState({}, '', '/?lineCallback=1&code=abc&state=state');
    render(<App />);

    expect(await screen.findByText('Mock Line Callback')).toBeInTheDocument();
    expect(init).not.toHaveBeenCalled();
  });

  test('returns from callback query to lobby without full page reload', async () => {
    window.history.pushState({}, '', '/?lineCallback=1&code=abc&state=state');
    const user = userEvent.setup();
    render(<App />);

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Mock Return' }));
    });

    expect(screen.getByText('Mock Lobby Page')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/');
    expect(window.location.search).toBe('');
  });

  test('renders game room through its lazy route', async () => {
    window.history.pushState({}, '', '/game/ROOM01');
    render(<App />);

    expect(await screen.findByText('Mock Game Room')).toBeInTheDocument();
  });

  test('resolves router mode for browser and github pages hosts', () => {
    expect(resolveRouterMode('localhost:3000')).toBe('BrowserRouter');
    expect(resolveRouterMode('newhandarky.github.io')).toBe('HashRouter');
  });
});
