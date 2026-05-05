import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { gameWebSocket } from '../../services/websocket';
import Lobby from './index';
import { CHARACTER_SET_OPTIONS } from './characterSetOptions';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

jest.mock('../../services/websocket', () => {
    const messageHandlers = new Map();

    return {
        __esModule: true,
        gameWebSocket: {
            connect: jest.fn().mockResolvedValue(undefined),
            isConnected: jest.fn(() => true),
            on: jest.fn((messageType, handler) => {
                messageHandlers.set(messageType, handler);
            }),
            off: jest.fn((messageType) => {
                messageHandlers.delete(messageType);
            }),
            send: jest.fn(),
            messageHandlers
        }
    };
});

jest.mock('../../utils/lineLiff', () => ({
    getInviteRoomIdFromLocation: () => ({ roomId: '', source: null }),
    getLineProfile: jest.fn().mockResolvedValue(null)
}));

const mockGameWebSocket = gameWebSocket as jest.Mocked<typeof gameWebSocket>;
const mockRegisteredHandlers = mockGameWebSocket.messageHandlers;

describe('Lobby character set selection', () => {
    beforeEach(() => {
        mockNavigate.mockReset();
        mockRegisteredHandlers.clear();
        mockGameWebSocket.connect.mockClear();
        mockGameWebSocket.isConnected.mockClear();
        mockGameWebSocket.isConnected.mockReturnValue(true);
        mockGameWebSocket.on.mockClear();
        mockGameWebSocket.off.mockClear();
        mockGameWebSocket.send.mockClear();
        window.localStorage.clear();
        jest.spyOn(window, 'alert').mockImplementation(() => undefined);
        CHARACTER_SET_OPTIONS.forEach((option) => {
            option.available = true;
            option.disabledReason = undefined;
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const renderLobby = () => render(<Lobby />);

    test('renders Ginza-branded homepage without homepage diagnostics block', () => {
        renderLobby();

        expect(screen.getByRole('heading', { name: '銀座十字路' })).toBeInTheDocument();
        expect(screen.getByText('Ginza Crossroads')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '系統診斷' })).toBeInTheDocument();
        expect(screen.queryByText(/環境:/)).not.toBeInTheDocument();
        expect(screen.queryByText(/WebSocket:/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Router:/)).not.toBeInTheDocument();
        expect(screen.queryByText(/已註冊事件:/)).not.toBeInTheDocument();
    });

    test('untouched room creation uses default Ginza set', async () => {
        renderLobby();

        await userEvent.type(screen.getByPlaceholderText('輸入你的名稱'), 'host');
        await waitFor(() => expect(screen.getByRole('button', { name: '🏠 建立房間' })).toBeEnabled());

        await userEvent.click(screen.getByRole('button', { name: '🏠 建立房間' }));

        expect(mockGameWebSocket.send).toHaveBeenCalledWith(
            'CREATE_ROOM',
            expect.objectContaining({
                playerId: 'host',
                mode: 'online',
                geishaSet: 'default',
                setupMode: 'random'
            })
        );
        expect(mockGameWebSocket.send).toHaveBeenCalledWith(
            'CREATE_ROOM',
            expect.not.objectContaining({
                customSelection: expect.anything()
            })
        );
    });

    test('selected character set is preserved when switching between online and npc', async () => {
        renderLobby();

        const selector = screen.getByRole('combobox', { name: '女公關組合' });
        await userEvent.selectOptions(selector, 'hololive');
        expect(selector).toHaveValue('hololive');

        await userEvent.click(screen.getByRole('radio', { name: '對戰 NPC' }));
        expect(selector).toHaveValue('hololive');

        await userEvent.click(screen.getByRole('radio', { name: '線上玩家' }));
        expect(selector).toHaveValue('hololive');
    });

    test('npc room creation sends selected geisha set', async () => {
        renderLobby();

        await userEvent.click(screen.getByRole('radio', { name: '對戰 NPC' }));
        await userEvent.selectOptions(screen.getByRole('combobox', { name: '女公關組合' }), 'hololive');
        await userEvent.type(screen.getByPlaceholderText('輸入你的名稱'), 'npc-host');
        await waitFor(() => expect(screen.getByRole('button', { name: '🏠 建立房間' })).toBeEnabled());

        await userEvent.click(screen.getByRole('button', { name: '🏠 建立房間' }));

        expect(mockGameWebSocket.send).toHaveBeenCalledWith(
            'CREATE_ROOM',
            expect.objectContaining({
                playerId: 'npc-host',
                mode: 'npc',
                geishaSet: 'hololive',
                setupMode: 'random',
                aiDifficulty: 'easy'
            })
        );
    });

    test('untouched npc room creation still uses default Ginza set', async () => {
        renderLobby();

        await userEvent.click(screen.getByRole('radio', { name: '對戰 NPC' }));
        await userEvent.type(screen.getByPlaceholderText('輸入你的名稱'), 'npc-default');
        await waitFor(() => expect(screen.getByRole('button', { name: '🏠 建立房間' })).toBeEnabled());

        await userEvent.click(screen.getByRole('button', { name: '🏠 建立房間' }));

        expect(mockGameWebSocket.send).toHaveBeenCalledWith(
            'CREATE_ROOM',
            expect.objectContaining({
                playerId: 'npc-default',
                mode: 'npc',
                geishaSet: 'default',
                setupMode: 'random'
            })
        );
    });

    test('join room submission does not depend on selectedGeishaSet', async () => {
        renderLobby();

        await userEvent.selectOptions(screen.getByRole('combobox', { name: '女公關組合' }), 'collaboration');
        await userEvent.type(screen.getByPlaceholderText('輸入你的名稱'), 'joiner');
        await userEvent.type(screen.getByPlaceholderText('輸入房間代碼'), 'abc123');
        await waitFor(() => expect(screen.getByRole('button', { name: '🚪 加入房間' })).toBeEnabled());

        await userEvent.click(screen.getByRole('button', { name: '🚪 加入房間' }));

        expect(mockGameWebSocket.send).toHaveBeenCalledWith(
            'JOIN_ROOM',
            expect.objectContaining({
                roomId: 'ABC123',
                playerId: 'joiner'
            })
        );
        expect(mockGameWebSocket.send).not.toHaveBeenCalledWith(
            'JOIN_ROOM',
            expect.objectContaining({
                geishaSet: expect.anything()
            })
        );
    });

    test('diagnostics entry stays available without replacing primary room actions', () => {
        renderLobby();

        expect(screen.getByRole('button', { name: '系統診斷' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '🏠 建立房間' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '🚪 加入房間' })).toBeInTheDocument();
    });

    test('temporarily unavailable sets stay visible but disabled', () => {
        CHARACTER_SET_OPTIONS[1].available = false;
        CHARACTER_SET_OPTIONS[1].disabledReason = '資料不足';

        renderLobby();

        const unavailableOption = screen.getByRole('option', { name: '擅自合作系列（目前不可用）' });
        expect(unavailableOption).toBeDisabled();
        expect(screen.getByText('不可用的女公關組合會保留顯示，但目前無法建立房間。')).toBeInTheDocument();
    });

    test('room creation error keeps the selected set for retry', async () => {
        renderLobby();

        const selector = screen.getByRole('combobox', { name: '女公關組合' });
        await userEvent.selectOptions(selector, 'hololive');
        await userEvent.type(screen.getByPlaceholderText('輸入你的名稱'), 'retry-player');
        await waitFor(() => expect(screen.getByRole('button', { name: '🏠 建立房間' })).toBeEnabled());

        await userEvent.click(screen.getByRole('button', { name: '🏠 建立房間' }));
        mockRegisteredHandlers.get('ERROR')?.({ message: '建立失敗' });

        expect(selector).toHaveValue('hololive');
    });

    test('custom setup preselects exactly-seven sets and sends selected character IDs', async () => {
        renderLobby();

        await userEvent.selectOptions(screen.getByRole('combobox', { name: '女公關組合' }), 'hololive');
        await userEvent.click(screen.getByRole('radio', { name: '自選七位' }));

        await waitFor(() => expect(screen.getByText('已選 7 / 7，可以建立房間')).toBeInTheDocument());

        await userEvent.type(screen.getByPlaceholderText('輸入你的名稱'), 'custom-host');
        await waitFor(() => expect(screen.getByRole('button', { name: '🏠 建立房間' })).toBeEnabled());
        await userEvent.click(screen.getByRole('button', { name: '🏠 建立房間' }));

        expect(mockGameWebSocket.send).toHaveBeenCalledWith(
            'CREATE_ROOM',
            expect.objectContaining({
                playerId: 'custom-host',
                mode: 'online',
                geishaSet: 'hololive',
                setupMode: 'custom',
                customSelection: {
                    characterIds: [
                        'hololive-raden',
                        'hololive-iroha',
                        'hololive-miko',
                        'hololive-fubuki',
                        'hololive-ayame',
                        'hololive-ina',
                        'hololive-mio'
                    ]
                }
            })
        );
    });

    test('custom setup disables room creation until exactly seven characters are selected', async () => {
        renderLobby();

        await userEvent.click(screen.getByRole('radio', { name: '自選七位' }));
        await userEvent.type(screen.getByPlaceholderText('輸入你的名稱'), 'needs-seven');
        await waitFor(() => expect(screen.getByRole('button', { name: '🏠 建立房間' })).toBeEnabled());

        await userEvent.click(screen.getByRole('button', { name: 'エマ' }));

        expect(screen.getByText('已選 6 / 7，請選滿七位')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '🏠 建立房間' })).toBeDisabled();
    });

    test('switching character sets revalidates custom preselection', async () => {
        renderLobby();

        await userEvent.click(screen.getByRole('radio', { name: '自選七位' }));
        await waitFor(() => expect(screen.getByText('已選 7 / 7，可以建立房間')).toBeInTheDocument());

        await userEvent.selectOptions(screen.getByRole('combobox', { name: '女公關組合' }), 'collaboration');

        await waitFor(() => expect(screen.getByRole('button', { name: 'ルミナス' })).toHaveAttribute('aria-pressed', 'true'));
        expect(screen.getByText('已選 7 / 7，可以建立房間')).toBeInTheDocument();
    });

    test('room creation error keeps custom setup available for correction', async () => {
        renderLobby();

        await userEvent.click(screen.getByRole('radio', { name: '自選七位' }));
        await waitFor(() => expect(screen.getByText('已選 7 / 7，可以建立房間')).toBeInTheDocument());
        await userEvent.type(screen.getByPlaceholderText('輸入你的名稱'), 'retry-custom');
        await waitFor(() => expect(screen.getByRole('button', { name: '🏠 建立房間' })).toBeEnabled());

        await userEvent.click(screen.getByRole('button', { name: '🏠 建立房間' }));
        mockRegisteredHandlers.get('ERROR')?.({ message: '自訂角色選擇無效，請重新選擇七位同組合角色。' });

        expect(screen.getByRole('radio', { name: '自選七位' })).toBeChecked();
        expect(screen.getByText('已選 7 / 7，可以建立房間')).toBeInTheDocument();
    });

    test('default runtime does not emit diagnostic request summaries during room creation', async () => {
        const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => undefined);

        renderLobby();

        await userEvent.type(screen.getByPlaceholderText('輸入你的名稱'), 'quiet-host');
        await waitFor(() => expect(screen.getByRole('button', { name: '🏠 建立房間' })).toBeEnabled());

        await userEvent.click(screen.getByRole('button', { name: '🏠 建立房間' }));

        expect(debugSpy).not.toHaveBeenCalled();
    });
});
