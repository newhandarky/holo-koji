import { fireEvent, render, screen } from '@testing-library/react';
import type { AchievementStatusResult, AchievementSummaryItem, LineAccountProfile } from '@newhandarky/hanakoji-game-types';
import LobbyHeroAside from './LobbyHeroAside';

const achievementItems: AchievementSummaryItem[] = [
    {
        achievementId: 'first_completed_match',
        title: '初次花見',
        description: '完成第一場對局。',
        state: 'unlocked',
        currentValue: 1,
        target: 1,
        unlockedAt: '2026-05-05T12:00:00.000Z',
        isNew: true
    },
    {
        achievementId: 'complete_3_matches',
        title: '熟客',
        description: '完成三場對局。',
        state: 'in_progress',
        currentValue: 1,
        target: 3,
        isNew: false
    }
];

const availableStatus: AchievementStatusResult = {
    status: 'available',
    persistenceStatus: {
        mode: 'durable',
        available: true,
        message: 'Account profiles are persistent.'
    },
    newUnlockCount: 1,
    items: achievementItems,
    generatedAt: '2026-05-05T12:00:00.000Z'
};

const boundAccountProfile: LineAccountProfile = {
    lineUserId: 'line-1',
    displayName: '玩家一',
    avatarUrl: 'https://example.test/avatar.png',
    createdAt: '2026-05-05T12:00:00.000Z',
    updatedAt: '2026-05-05T12:00:00.000Z',
    counters: {
        gamesPlayed: 1,
        wins: 1,
        lastPlayedAt: '2026-05-05T12:00:00.000Z'
    }
};

const renderAside = (overrides: Partial<React.ComponentProps<typeof LobbyHeroAside>> = {}) => {
    const props: React.ComponentProps<typeof LobbyHeroAside> = {
        achievementItems: [],
        achievementMessage: undefined,
        achievementNewUnlockCount: 0,
        achievementStatus: null,
        boundAccountProfile: null,
        accountBindingStatus: 'idle',
        connectionStatus: 'connected',
        isAchievementPanelOpen: false,
        onOpenAchievements: jest.fn(),
        onBindLineAccount: jest.fn(),
        ...overrides
    };
    render(<LobbyHeroAside {...props} />);
    return props;
};

describe('LobbyHeroAside', () => {
    test('shows achievement badge and available achievement list', () => {
        const props = renderAside({
            achievementItems,
            achievementNewUnlockCount: 1,
            achievementStatus: availableStatus,
            isAchievementPanelOpen: true
        });

        expect(screen.getByText('新解鎖 1')).toBeInTheDocument();
        expect(screen.getByText('初次花見')).toBeInTheDocument();
        expect(screen.getByText('新')).toBeInTheDocument();
        expect(screen.getByText('1 / 3')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /成就/ }));

        expect(props.onOpenAchievements).toHaveBeenCalledTimes(1);
    });

    test('shows empty achievement status message', () => {
        renderAside({
            achievementStatus: {
                status: 'guest',
                message: '成就需要綁定帳號後才會保存。',
                persistenceStatus: {
                    mode: 'temporary',
                    available: true,
                    message: 'Account profiles are temporary.'
                }
            },
            achievementMessage: '成就需要綁定帳號後才會保存。',
            isAchievementPanelOpen: true
        });

        expect(screen.getByRole('status')).toHaveTextContent('成就需要綁定帳號後才會保存。');
    });

    test('shows bound account and hides bind button', () => {
        renderAside({ boundAccountProfile });

        expect(screen.getByText('已綁定：玩家一')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: '綁定 LINE 帳號' })).not.toBeInTheDocument();
    });

    test('bind button respects connection and binding state', () => {
        const disconnectedProps = renderAside({ connectionStatus: 'disconnected' });

        expect(screen.getByRole('button', { name: '綁定 LINE 帳號' })).toBeDisabled();
        expect(disconnectedProps.onBindLineAccount).not.toHaveBeenCalled();

        renderAside({ accountBindingStatus: 'binding' });

        expect(screen.getByRole('button', { name: '綁定中...' })).toBeDisabled();
    });

    test('dispatches bind action when available', () => {
        const props = renderAside();

        fireEvent.click(screen.getByRole('button', { name: '綁定 LINE 帳號' }));

        expect(props.onBindLineAccount).toHaveBeenCalledTimes(1);
    });
});
