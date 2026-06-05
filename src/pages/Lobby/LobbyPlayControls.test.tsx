import type React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CharacterProfile } from '@newhandarky/hanakoji-game-types';
import LobbyPlayControls from './LobbyPlayControls';

type LobbyPlayControlsProps = React.ComponentProps<typeof LobbyPlayControls>;

const characterProfiles: CharacterProfile[] = Array.from({ length: 8 }, (_, index) => ({
    characterId: `character-${index + 1}`,
    name: `角色 ${index + 1}`,
    imageUrl: `/characters/${index + 1}.png`
}));

const defaultProps: LobbyPlayControlsProps = {
    playerName: '',
    roomId: '',
    matchMode: 'online' as const,
    aiDifficulty: 'easy' as const,
    selectedGeishaSet: 'default' as const,
    setupMode: 'random' as const,
    availableCharacterProfiles: characterProfiles,
    selectedCharacterIds: [],
    customSelectionCount: 0,
    isConnecting: false,
    canCreateRoom: false,
    canJoinRoom: false,
    hasUnavailableCharacterSet: false,
    onPlayerNameChange: jest.fn(),
    onRoomIdChange: jest.fn(),
    onMatchModeChange: jest.fn(),
    onAiDifficultyChange: jest.fn(),
    onGeishaSetChange: jest.fn(),
    onSetupModeChange: jest.fn(),
    onCharacterSelectionToggle: jest.fn(),
    onCopyInviteRoomId: jest.fn(),
    onClearInviteRecovery: jest.fn(),
    onCreateRoom: jest.fn(),
    onJoinRoom: jest.fn()
};

const renderLobbyPlayControls = (overrides: Partial<LobbyPlayControlsProps> = {}) => {
    const props = {
        ...defaultProps,
        ...overrides
    };

    return {
        user: userEvent.setup(),
        props,
        ...render(<LobbyPlayControls {...props} />)
    };
};

describe('LobbyPlayControls', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('keeps create and join commands disabled until parent state allows them', () => {
        renderLobbyPlayControls();

        expect(screen.getByRole('button', { name: '🏠 建立房間' })).toBeDisabled();
        expect(screen.getByRole('button', { name: '🚪 加入房間' })).toBeDisabled();
    });

    test('emits normalized room id and create join commands through existing callbacks', async () => {
        const { user, props } = renderLobbyPlayControls({
            playerName: 'host',
            roomId: 'ABC123',
            canCreateRoom: true,
            canJoinRoom: true
        });

        await user.type(screen.getByPlaceholderText('輸入房間代碼'), 'z9');
        await user.click(screen.getByRole('button', { name: '🏠 建立房間' }));
        fireEvent.change(screen.getByPlaceholderText('輸入房間代碼'), {
            target: { value: 'z9' }
        });
        await user.click(screen.getByRole('button', { name: '🚪 加入房間' }));

        expect(props.onRoomIdChange).toHaveBeenLastCalledWith('Z9');
        expect(props.onCreateRoom).toHaveBeenCalledTimes(1);
        expect(props.onJoinRoom).toHaveBeenCalledTimes(1);
    });

    test('custom setup shows readiness and toggles selected character cards', async () => {
        const { user, props } = renderLobbyPlayControls({
            setupMode: 'custom',
            selectedCharacterIds: characterProfiles.slice(0, 7).map((profile) => profile.characterId),
            customSelectionCount: 7
        });

        expect(screen.getByText('已選 7 / 7，可以建立房間')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '角色 1' })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: '角色 8' })).toHaveAttribute('aria-pressed', 'false');

        await user.click(screen.getByRole('button', { name: '角色 8' }));

        expect(props.onCharacterSelectionToggle).toHaveBeenCalledWith('character-8');
    });

    test('invite recovery keeps copy and recovery actions isolated', async () => {
        const { user, props } = renderLobbyPlayControls({
            inviteRecovery: {
                roomId: 'ROOM01',
                message: '找不到這個邀請房間。請確認房號，或請對方重送邀請。'
            }
        });

        expect(screen.getByRole('alert')).toHaveTextContent('ROOM01');

        await user.click(screen.getByRole('button', { name: '複製房號' }));
        await user.click(screen.getByRole('button', { name: '回到一般加入' }));

        expect(props.onCopyInviteRoomId).toHaveBeenCalledTimes(1);
        expect(props.onClearInviteRecovery).toHaveBeenCalledTimes(1);
    });

    test('npc mode shows difficulty controls and hides join room controls', async () => {
        const { user, props } = renderLobbyPlayControls({
            matchMode: 'npc',
            aiDifficulty: 'expert'
        });

        expect(screen.getByRole('combobox', { name: 'AI 難度' })).toHaveValue('expert');
        expect(screen.queryByRole('button', { name: '🚪 加入房間' })).not.toBeInTheDocument();

        await user.selectOptions(screen.getByRole('combobox', { name: 'AI 難度' }), 'hell');

        expect(props.onAiDifficultyChange).toHaveBeenCalledWith('hell');
    });
});
