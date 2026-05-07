import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { gameWebSocket } from '../../services/websocket';
import Lobby from './index';
import { AI_DIFFICULTY_OPTIONS, normalizeAiDifficulty } from './aiDifficultyOptions';
import { CHARACTER_SET_OPTIONS } from './characterSetOptions';
import { getInviteRoomIdFromLocation, getVerifiedLineProfile } from '../../utils/lineLiff';
import { beginBrowserLineLogin, requestAccountStatus, syncLineAccountWithIdToken } from '../../utils/lineAccount';
import { acknowledgeAchievementUnlocks, requestAchievementStatus } from '../../utils/achievementAccount';

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
    getInviteRoomIdFromLocation: jest.fn(() => ({ roomId: '', source: 'none' })),
    getVerifiedLineProfile: jest.fn().mockResolvedValue(null)
}));

jest.mock('../../utils/lineAccount', () => ({
    beginBrowserLineLogin: jest.fn(),
    getBoundAccountProfile: (result: any) => (result?.status === 'bound' ? result.profile : null),
    requestAccountStatus: jest.fn().mockResolvedValue({
        status: 'guest',
        persistenceStatus: {
            mode: 'temporary',
            available: true,
            message: 'Account profiles are temporary in this environment.'
        }
    }),
    syncLineAccountWithIdToken: jest.fn().mockResolvedValue({
        status: 'guest',
        persistenceStatus: {
            mode: 'temporary',
            available: true,
            message: 'Account profiles are temporary in this environment.'
        }
    })
}));

jest.mock('../../utils/achievementAccount', () => ({
    requestAchievementStatus: jest.fn().mockResolvedValue({
        status: 'guest',
        message: '成就需要綁定帳號後才會保存。',
        persistenceStatus: {
            mode: 'temporary',
            available: true,
            message: 'Account profiles are temporary in this environment.'
        }
    }),
    acknowledgeAchievementUnlocks: jest.fn()
}));

const mockGameWebSocket = gameWebSocket as jest.Mocked<typeof gameWebSocket>;
const mockRegisteredHandlers = mockGameWebSocket.messageHandlers;
const mockGetInviteRoomIdFromLocation = getInviteRoomIdFromLocation as jest.MockedFunction<typeof getInviteRoomIdFromLocation>;
const mockGetVerifiedLineProfile = getVerifiedLineProfile as jest.MockedFunction<typeof getVerifiedLineProfile>;
const mockBeginBrowserLineLogin = beginBrowserLineLogin as jest.MockedFunction<typeof beginBrowserLineLogin>;
const mockRequestAccountStatus = requestAccountStatus as jest.MockedFunction<typeof requestAccountStatus>;
const mockSyncLineAccountWithIdToken = syncLineAccountWithIdToken as jest.MockedFunction<typeof syncLineAccountWithIdToken>;
const mockRequestAchievementStatus = requestAchievementStatus as jest.MockedFunction<typeof requestAchievementStatus>;
const mockAcknowledgeAchievementUnlocks = acknowledgeAchievementUnlocks as jest.MockedFunction<typeof acknowledgeAchievementUnlocks>;

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
        mockGetInviteRoomIdFromLocation.mockReset();
        mockGetInviteRoomIdFromLocation.mockReturnValue({ roomId: '', source: 'none' });
        mockGetVerifiedLineProfile.mockReset();
        mockGetVerifiedLineProfile.mockResolvedValue(null);
        mockBeginBrowserLineLogin.mockReset();
        mockRequestAccountStatus.mockReset();
        mockRequestAccountStatus.mockResolvedValue({
            status: 'guest',
            persistenceStatus: {
                mode: 'temporary',
                available: true,
                message: 'Account profiles are temporary in this environment.'
            }
        });
        mockSyncLineAccountWithIdToken.mockReset();
        mockSyncLineAccountWithIdToken.mockResolvedValue({
            status: 'guest',
            persistenceStatus: {
                mode: 'temporary',
                available: true,
                message: 'Account profiles are temporary in this environment.'
            }
        });
        mockRequestAchievementStatus.mockReset();
        mockRequestAchievementStatus.mockResolvedValue({
            status: 'guest',
            message: '成就需要綁定帳號後才會保存。',
            persistenceStatus: {
                mode: 'temporary',
                available: true,
                message: 'Account profiles are temporary in this environment.'
            }
        });
        mockAcknowledgeAchievementUnlocks.mockReset();
        mockAcknowledgeAchievementUnlocks.mockResolvedValue({
            status: 'available',
            persistenceStatus: {
                mode: 'durable',
                available: true,
                message: 'Account profiles are persistent.'
            },
            newUnlockCount: 0,
            items: [],
            generatedAt: '2026-05-05T12:00:00.000Z'
        });
        window.localStorage.clear();
        jest.spyOn(window, 'alert').mockImplementation(() => undefined);
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: { writeText: jest.fn().mockResolvedValue(undefined) }
        });
        CHARACTER_SET_OPTIONS.forEach((option) => {
            option.available = true;
            option.disabledReason = undefined;
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const renderLobby = () => render(<Lobby />);
    const emitServerError = async (payload: { message: string; code?: string }) => {
        await waitFor(() => expect(mockGameWebSocket.on).toHaveBeenCalledWith('ERROR', expect.any(Function)));
        const errorHandlerCall = [...mockGameWebSocket.on.mock.calls]
            .reverse()
            .find(([messageType]) => messageType === 'ERROR');
        const errorHandler = errorHandlerCall?.[1] as ((payload: unknown) => void) | undefined;
        expect(errorHandler).toEqual(expect.any(Function));
        act(() => {
            errorHandler?.(payload);
        });
    };

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

    test('npc mode renders canonical AI difficulty dropdown labels and descriptions only', async () => {
        renderLobby();

        await userEvent.click(screen.getByRole('radio', { name: '對戰 NPC' }));

        const difficultySelect = screen.getByRole('combobox', { name: 'AI 難度' });
        const difficultyOptions = Array.from(difficultySelect.querySelectorAll('option'));

        expect(difficultyOptions).toHaveLength(AI_DIFFICULTY_OPTIONS.length);
        expect(difficultyOptions.map((option) => option.getAttribute('value'))).toEqual(
            AI_DIFFICULTY_OPTIONS.map((option) => option.value)
        );

        AI_DIFFICULTY_OPTIONS.forEach((option) => {
            expect(screen.getByRole('option', { name: `${option.label} - ${option.description}` })).toBeInTheDocument();
        });
        expect(difficultySelect).toHaveValue('easy');
        expect(screen.getByText('適合初次體驗')).toBeInTheDocument();

        ['しぐれうい', '大空スバル', '兎田ぺこら', '猫又おかゆ', 'ときのそら'].forEach((personName) => {
            expect(screen.queryByText(personName)).not.toBeInTheDocument();
        });
    });

    test('npc difficulty control supports compact selection', async () => {
        renderLobby();

        await userEvent.click(screen.getByRole('radio', { name: '對戰 NPC' }));

        const difficultySelect = screen.getByRole('combobox', { name: 'AI 難度' });
        difficultySelect.focus();
        await userEvent.selectOptions(difficultySelect, 'hard');

        expect(difficultySelect).toHaveFocus();
        expect(difficultySelect).toHaveValue('hard');
        expect(screen.getByText('需要穩定判斷')).toBeInTheDocument();
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

    test('online mode does not render active AI difficulty content', async () => {
        renderLobby();

        expect(screen.queryByRole('combobox', { name: 'AI 難度' })).not.toBeInTheDocument();
        expect(screen.queryByText('適合初次體驗')).not.toBeInTheDocument();
    });

    test('selected AI difficulty is preserved when switching between npc and online', async () => {
        renderLobby();

        await userEvent.click(screen.getByRole('radio', { name: '對戰 NPC' }));
        await userEvent.selectOptions(screen.getByRole('combobox', { name: 'AI 難度' }), 'hell');

        expect(screen.getByRole('combobox', { name: 'AI 難度' })).toHaveValue('hell');

        await userEvent.click(screen.getByRole('radio', { name: '線上玩家' }));
        expect(screen.queryByRole('combobox', { name: 'AI 難度' })).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('radio', { name: '對戰 NPC' }));
        expect(screen.getByRole('combobox', { name: 'AI 難度' })).toHaveValue('hell');
    });

    test.each(AI_DIFFICULTY_OPTIONS)('npc room creation maps displayed $label difficulty to $value', async (option) => {
        renderLobby();

        await userEvent.click(screen.getByRole('radio', { name: '對戰 NPC' }));
        await userEvent.selectOptions(screen.getByRole('combobox', { name: 'AI 難度' }), option.value);
        await userEvent.type(screen.getByPlaceholderText('輸入你的名稱'), `npc-${option.value}`);
        await waitFor(() => expect(screen.getByRole('button', { name: '🏠 建立房間' })).toBeEnabled());

        await userEvent.click(screen.getByRole('button', { name: '🏠 建立房間' }));

        expect(mockGameWebSocket.send).toHaveBeenCalledWith(
            'CREATE_ROOM',
            expect.objectContaining({
                playerId: `npc-${option.value}`,
                mode: 'npc',
                aiDifficulty: option.value
            })
        );
    });

    test('online room creation omits aiDifficulty after npc difficulty changes', async () => {
        renderLobby();

        await userEvent.click(screen.getByRole('radio', { name: '對戰 NPC' }));
        await userEvent.selectOptions(screen.getByRole('combobox', { name: 'AI 難度' }), 'expert');
        await userEvent.click(screen.getByRole('radio', { name: '線上玩家' }));
        await userEvent.type(screen.getByPlaceholderText('輸入你的名稱'), 'online-host');
        await waitFor(() => expect(screen.getByRole('button', { name: '🏠 建立房間' })).toBeEnabled());

        await userEvent.click(screen.getByRole('button', { name: '🏠 建立房間' }));

        expect(mockGameWebSocket.send).toHaveBeenCalledWith(
            'CREATE_ROOM',
            expect.objectContaining({
                playerId: 'online-host',
                mode: 'online'
            })
        );
        expect(mockGameWebSocket.send).toHaveBeenCalledWith(
            'CREATE_ROOM',
            expect.not.objectContaining({
                aiDifficulty: expect.anything()
            })
        );
    });

    test('invalid AI difficulty values normalize to easy', () => {
        expect(normalizeAiDifficulty('unknown')).toBe('easy');
        expect(normalizeAiDifficulty(null)).toBe('easy');
        expect(normalizeAiDifficulty('hell')).toBe('hell');
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

    test('join room block stays in the right lobby panel while achievements stay on the hero side', () => {
        const { container } = renderLobby();

        const lobbyPanel = container.querySelector('.lobby-panel');
        const lobbyHero = container.querySelector('.lobby-hero');

        expect(lobbyPanel).toContainElement(screen.getByRole('button', { name: '🚪 加入房間' }));
        expect(lobbyHero).not.toContainElement(screen.getByRole('button', { name: '🚪 加入房間' }));
        expect(lobbyHero).toContainElement(screen.getByRole('button', { name: /成就/ }));
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

    test('explicit LINE binding pre-fills name and sends bound account presentation only', async () => {
        mockGetVerifiedLineProfile.mockResolvedValue({
            profile: {
                userId: 'U1234567890',
                displayName: 'LINE 玩家',
                pictureUrl: 'https://example.test/avatar.png'
            },
            idToken: 'line-id-token'
        });
        mockSyncLineAccountWithIdToken.mockResolvedValue({
            status: 'bound',
            profile: {
                lineUserId: 'U1234567890',
                displayName: 'LINE 玩家',
                avatarUrl: 'https://example.test/avatar.png',
                createdAt: '2026-05-05T12:00:00.000Z',
                updatedAt: '2026-05-05T12:00:00.000Z',
                counters: {
                    gamesPlayed: 0,
                    wins: 0,
                    lastPlayedAt: null
                }
            },
            persistenceStatus: {
                mode: 'durable',
                available: true,
                message: 'Account profiles are persistent.'
            }
        });

        renderLobby();

        await userEvent.click(screen.getByRole('button', { name: '綁定 LINE 帳號' }));
        await waitFor(() => expect(screen.getByPlaceholderText('輸入你的名稱')).toHaveValue('LINE 玩家'));
        await waitFor(() => expect(mockSyncLineAccountWithIdToken).toHaveBeenCalledTimes(1));
        await userEvent.clear(screen.getByPlaceholderText('輸入你的名稱'));
        await userEvent.type(screen.getByPlaceholderText('輸入你的名稱'), '房間暱稱');
        await waitFor(() => expect(screen.getByRole('button', { name: '🏠 建立房間' })).toBeEnabled());
        await userEvent.click(screen.getByRole('button', { name: '🏠 建立房間' }));

        expect(mockSyncLineAccountWithIdToken).toHaveBeenCalledWith(
            {
                userId: 'U1234567890',
                displayName: 'LINE 玩家',
                pictureUrl: 'https://example.test/avatar.png'
            },
            'line-id-token'
        );
        await waitFor(() =>
            expect(mockGameWebSocket.send).toHaveBeenCalledWith(
                'CREATE_ROOM',
                expect.objectContaining({
                    playerId: '房間暱稱',
                    displayName: '房間暱稱',
                    lineUserId: 'U1234567890',
                    avatarUrl: 'https://example.test/avatar.png'
                })
            )
        );
    });

    test('missing LINE profile keeps guest room creation independent from account proof', async () => {
        renderLobby();

        await userEvent.type(screen.getByPlaceholderText('輸入你的名稱'), 'guest-host');
        await waitFor(() => expect(screen.getByRole('button', { name: '🏠 建立房間' })).toBeEnabled());
        await userEvent.click(screen.getByRole('button', { name: '🏠 建立房間' }));

        expect(mockSyncLineAccountWithIdToken).not.toHaveBeenCalled();
        expect(mockGameWebSocket.send).toHaveBeenCalledWith(
            'CREATE_ROOM',
            expect.not.objectContaining({
                lineUserId: expect.anything(),
                avatarUrl: expect.anything()
            })
        );
    });

    test('browser LINE binding starts authorization redirect when LIFF id token is unavailable', async () => {
        mockGetVerifiedLineProfile.mockResolvedValue(null);

        renderLobby();

        await userEvent.click(screen.getByRole('button', { name: '綁定 LINE 帳號' }));

        await waitFor(() => expect(mockBeginBrowserLineLogin).toHaveBeenCalledTimes(1));
        expect(mockSyncLineAccountWithIdToken).not.toHaveBeenCalled();
    });

    test('account sync failure shows non-blocking guest notice and still allows room creation', async () => {
        mockGetVerifiedLineProfile.mockResolvedValue({
            profile: {
                userId: 'U1234567890',
                displayName: 'LINE 玩家'
            },
            idToken: 'line-id-token'
        });
        mockSyncLineAccountWithIdToken.mockResolvedValue({
            status: 'sync-failed',
            guestNotice: '目前以訪客模式繼續，帳號進度暫時不會保存。',
            persistenceStatus: {
                mode: 'temporary',
                available: true,
                message: 'Account profiles are temporary in this environment.'
            }
        });

        renderLobby();

        await userEvent.click(screen.getByRole('button', { name: '綁定 LINE 帳號' }));
        expect(await screen.findByText('目前以訪客模式繼續，帳號進度暫時不會保存。')).toBeInTheDocument();
        await userEvent.clear(screen.getByPlaceholderText('輸入你的名稱'));
        await userEvent.type(screen.getByPlaceholderText('輸入你的名稱'), 'guest-after-fail');
        await waitFor(() => expect(screen.getByRole('button', { name: '🏠 建立房間' })).toBeEnabled());
        await userEvent.click(screen.getByRole('button', { name: '🏠 建立房間' }));

        expect(mockGameWebSocket.send).toHaveBeenCalledWith(
            'CREATE_ROOM',
            expect.objectContaining({
                playerId: 'guest-after-fail',
                displayName: 'guest-after-fail'
            })
        );
    });

    test('guest achievement entry shows non-persistent message', async () => {
        renderLobby();

        await userEvent.click(screen.getByRole('button', { name: /成就/ }));

        expect(await screen.findByText('成就需要綁定帳號後才會保存。')).toBeInTheDocument();
    });

    test('unavailable achievement state shows temporary unavailable message', async () => {
        mockRequestAchievementStatus.mockResolvedValue({
            status: 'unavailable',
            message: '成就暫時不可用，進度目前無法保存。',
            persistenceStatus: {
                mode: 'temporary',
                available: false,
                message: 'Account profiles are unavailable; durable persistence is not connected.'
            }
        });

        renderLobby();

        await userEvent.click(screen.getByRole('button', { name: /成就/ }));

        expect(await screen.findByText('成就暫時不可用，進度目前無法保存。')).toBeInTheDocument();
    });

    test('bound achievement view shows locked in-progress and unlocked starter achievements', async () => {
        mockRequestAchievementStatus.mockResolvedValue({
            status: 'available',
            persistenceStatus: {
                mode: 'durable',
                available: true,
                message: 'Account profiles are persistent.'
            },
            newUnlockCount: 0,
            generatedAt: '2026-05-05T12:00:00.000Z',
            items: [
                {
                    achievementId: 'first_completed_match',
                    title: '初次花見',
                    description: '完成第一場對局。',
                    state: 'unlocked',
                    currentValue: 1,
                    target: 1,
                    unlockedAt: '2026-05-05T12:00:00.000Z',
                    isNew: false
                },
                {
                    achievementId: 'complete_3_matches',
                    title: '三度赴約',
                    description: '完成 3 場對局。',
                    state: 'in_progress',
                    currentValue: 1,
                    target: 3,
                    isNew: false
                },
                {
                    achievementId: 'win_3_matches',
                    title: '三勝之姿',
                    description: '贏得 3 場對局。',
                    state: 'locked',
                    currentValue: 0,
                    target: 3,
                    isNew: false
                }
            ]
        });

        renderLobby();

        await userEvent.click(screen.getByRole('button', { name: /成就/ }));

        expect(await screen.findByText('初次花見')).toBeInTheDocument();
        expect(screen.getByText('1 / 1')).toBeInTheDocument();
        expect(screen.getByText('三度赴約')).toBeInTheDocument();
        expect(screen.getByText('1 / 3')).toBeInTheDocument();
        expect(screen.getByText('三勝之姿')).toBeInTheDocument();
        expect(screen.getByText('0 / 3')).toBeInTheDocument();
    });

    test('new unlock marker clears when opening achievements', async () => {
        mockRequestAchievementStatus.mockResolvedValue({
            status: 'available',
            persistenceStatus: {
                mode: 'durable',
                available: true,
                message: 'Account profiles are persistent.'
            },
            newUnlockCount: 1,
            generatedAt: '2026-05-05T12:00:00.000Z',
            items: [
                {
                    achievementId: 'first_completed_match',
                    title: '初次花見',
                    description: '完成第一場對局。',
                    state: 'unlocked',
                    currentValue: 1,
                    target: 1,
                    unlockedAt: '2026-05-05T12:00:00.000Z',
                    isNew: true
                }
            ]
        });
        mockAcknowledgeAchievementUnlocks.mockResolvedValue({
            status: 'available',
            persistenceStatus: {
                mode: 'durable',
                available: true,
                message: 'Account profiles are persistent.'
            },
            newUnlockCount: 0,
            generatedAt: '2026-05-05T12:01:00.000Z',
            items: [
                {
                    achievementId: 'first_completed_match',
                    title: '初次花見',
                    description: '完成第一場對局。',
                    state: 'unlocked',
                    currentValue: 1,
                    target: 1,
                    unlockedAt: '2026-05-05T12:00:00.000Z',
                    isNew: false
                }
            ]
        });

        renderLobby();

        expect(await screen.findByText('新解鎖 1')).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: /成就/ }));

        await waitFor(() => expect(mockAcknowledgeAchievementUnlocks).toHaveBeenCalledWith({
            achievementIds: ['first_completed_match']
        }));
        await waitFor(() => expect(screen.queryByText('新解鎖 1')).not.toBeInTheDocument());
    });

    test('invite query room id is prefilled and does not auto-join on page load', async () => {
        mockGetInviteRoomIdFromLocation.mockReturnValue({ roomId: 'abc123', source: 'query' });

        renderLobby();

        expect(await screen.findByText('已從邀請連結帶入房間 ABC123，確認玩家名稱後再加入。')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('輸入房間代碼')).toHaveValue('ABC123');
        expect(mockGameWebSocket.send).not.toHaveBeenCalledWith('JOIN_ROOM', expect.anything());
    });

    test('invite LIFF state room id is normalized for confirmed join only', async () => {
        mockGetInviteRoomIdFromLocation.mockReturnValue({ roomId: 'xyz789', source: 'liff' });
        const replaceStateSpy = jest.spyOn(window.history, 'replaceState').mockImplementation(() => undefined);

        renderLobby();

        expect(await screen.findByText('已從邀請連結帶入房間 XYZ789，確認玩家名稱後再加入。')).toBeInTheDocument();
        expect(replaceStateSpy).toHaveBeenCalled();
        await userEvent.type(screen.getByPlaceholderText('輸入你的名稱'), 'joiner');
        await waitFor(() => expect(screen.getByRole('button', { name: '🚪 加入房間' })).toBeEnabled());
        await userEvent.click(screen.getByRole('button', { name: '🚪 加入房間' }));

        expect(mockGameWebSocket.send).toHaveBeenCalledWith(
            'JOIN_ROOM',
            expect.objectContaining({
                roomId: 'XYZ789',
                playerId: 'joiner'
            })
        );
    });

    test('missing invited room shows recovery without losing original room id', async () => {
        mockGetInviteRoomIdFromLocation.mockReturnValue({ roomId: 'abc123', source: 'query' });

        renderLobby();
        await userEvent.type(screen.getByPlaceholderText('輸入你的名稱'), 'joiner');
        await waitFor(() => expect(screen.getByRole('button', { name: '🚪 加入房間' })).toBeEnabled());
        await userEvent.click(screen.getByRole('button', { name: '🚪 加入房間' }));
        await emitServerError({ message: '房間不存在', code: 'ROOM_NOT_FOUND' });

        expect(await screen.findByText('找不到這個邀請房間。請確認房號，或請對方重送邀請。')).toBeInTheDocument();
        expect(screen.getByText('ABC123')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '複製房號' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '回到一般加入' })).toBeInTheDocument();
    });

    test('full invited room shows recovery guidance', async () => {
        mockGetInviteRoomIdFromLocation.mockReturnValue({ roomId: 'full01', source: 'query' });

        renderLobby();
        await userEvent.type(screen.getByPlaceholderText('輸入你的名稱'), 'joiner');
        await waitFor(() => expect(screen.getByRole('button', { name: '🚪 加入房間' })).toBeEnabled());
        await userEvent.click(screen.getByRole('button', { name: '🚪 加入房間' }));
        await emitServerError({ message: '房間已滿', code: 'ROOM_FULL' });

        expect(await screen.findByText('這個邀請房間已滿。請對方重送邀請，或回到大廳建立新房間。')).toBeInTheDocument();
        expect(screen.getByText('FULL01')).toBeInTheDocument();
    });

    test('already-started invited room shows recovery guidance', async () => {
        mockGetInviteRoomIdFromLocation.mockReturnValue({ roomId: 'start1', source: 'query' });

        renderLobby();
        await userEvent.type(screen.getByPlaceholderText('輸入你的名稱'), 'joiner');
        await waitFor(() => expect(screen.getByRole('button', { name: '🚪 加入房間' })).toBeEnabled());
        await userEvent.click(screen.getByRole('button', { name: '🚪 加入房間' }));
        await emitServerError({ message: '房間已開始對局', code: 'ROOM_ALREADY_STARTED' });

        expect(await screen.findByText('這個邀請房間已經開始對局。請對方重送邀請，或回到大廳建立新房間。')).toBeInTheDocument();
        expect(screen.getByText('START1')).toBeInTheDocument();
    });

    test('invalid invited room join shows recovery guidance', async () => {
        mockGetInviteRoomIdFromLocation.mockReturnValue({ roomId: 'bad001', source: 'query' });

        renderLobby();
        await userEvent.type(screen.getByPlaceholderText('輸入你的名稱'), 'joiner');
        await waitFor(() => expect(screen.getByRole('button', { name: '🚪 加入房間' })).toBeEnabled());
        await userEvent.click(screen.getByRole('button', { name: '🚪 加入房間' }));
        await emitServerError({ message: '缺少 roomId 或 playerId', code: 'INVALID_JOIN_REQUEST' });

        expect(await screen.findByText('這個邀請連結資料不完整。請對方重送邀請，或回到一般加入流程。')).toBeInTheDocument();
        expect(screen.getByText('BAD001')).toBeInTheDocument();
    });

    test('unknown invited room join failure shows safe recovery guidance', async () => {
        mockGetInviteRoomIdFromLocation.mockReturnValue({ roomId: 'unk001', source: 'query' });

        renderLobby();
        await userEvent.type(screen.getByPlaceholderText('輸入你的名稱'), 'joiner');
        await waitFor(() => expect(screen.getByRole('button', { name: '🚪 加入房間' })).toBeEnabled());
        await userEvent.click(screen.getByRole('button', { name: '🚪 加入房間' }));
        await emitServerError({ message: 'unknown' });

        expect(await screen.findByText('目前無法加入這個邀請房間。請對方重送邀請，或回到一般加入流程。')).toBeInTheDocument();
        expect(screen.getByText('UNK001')).toBeInTheDocument();
    });
});
