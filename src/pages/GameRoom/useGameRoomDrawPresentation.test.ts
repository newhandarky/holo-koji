import { act, renderHook } from '@testing-library/react';
import type { FocusSection } from '../../components/game/GameBoard';
import { useGameRoomDrawPresentation } from './useGameRoomDrawPresentation';

describe('useGameRoomDrawPresentation', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('shows safe self-draw notification without exposing card id until viewer opens hand', () => {
        let focusSection: FocusSection = 'characterBoard';
        const setFocusSection = jest.fn((next: FocusSection | ((current: FocusSection) => FocusSection)) => {
            focusSection = typeof next === 'function' ? next(focusSection) : next;
        });
        const enqueueMotionCues = jest.fn();
        const consumeDrawEvent = jest.fn();
        const drawQueue = [{
            playerId: 'p1',
            card: { id: 'secret-draw-card', geishaId: 1, type: 'item' as const }
        }];

        const { result } = renderHook(() => useGameRoomDrawPresentation({
            drawQueue,
            consumeDrawEvent,
            currentPlayerId: 'p1',
            focusSection,
            setFocusSection,
            isInteractionLocked: false,
            getPlayerDisplayName: (playerId) => playerId ?? '未知玩家',
            enqueueMotionCues,
            prefersReducedMotion: true
        }));

        expect(result.current.isActiveSelfDrawNotification).toBe(true);
        expect(result.current.recentDraw).toBeNull();
        expect(result.current.drawHighlightCardId).toBeNull();

        act(() => {
            result.current.handleDrawNotificationViewNow();
        });

        expect(setFocusSection).toHaveBeenCalledWith('handActions');
        expect(result.current.drawHighlightCardId).toBe('secret-draw-card');
        expect(enqueueMotionCues).toHaveBeenCalledTimes(1);
    });

    test('opponent draw only shows player-safe text and consumes after timer', () => {
        const consumeDrawEvent = jest.fn();
        const { result } = renderHook(() => useGameRoomDrawPresentation({
            drawQueue: [{
                playerId: 'p2',
                card: { id: 'hidden-opponent-card', geishaId: 0, type: 'hidden' as const }
            }],
            consumeDrawEvent,
            currentPlayerId: 'p1',
            focusSection: 'characterBoard',
            setFocusSection: jest.fn(),
            isInteractionLocked: false,
            getPlayerDisplayName: () => '玩家二',
            enqueueMotionCues: jest.fn(),
            prefersReducedMotion: true
        }));

        expect(result.current.recentDraw).toBe('玩家二 抽到了新卡');
        expect(result.current.isActiveSelfDrawNotification).toBe(false);

        act(() => {
            jest.advanceTimersByTime(520);
        });

        expect(consumeDrawEvent).toHaveBeenCalledTimes(1);
    });
});
