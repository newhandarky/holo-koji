import { act, renderHook } from '@testing-library/react';
import type { FocusSection } from '../../components/game/GameBoard';
import { useGameRoomDrawPresentation } from './useGameRoomDrawPresentation';

type DrawPresentationOptions = Parameters<typeof useGameRoomDrawPresentation>[0];

const renderDrawPresentation = (overrides: Partial<DrawPresentationOptions> = {}) => {
    const baseOptions: DrawPresentationOptions = {
        drawQueue: [],
        consumeDrawEvent: jest.fn(),
        currentPlayerId: 'p1',
        focusSection: 'characterBoard',
        setFocusSection: jest.fn(),
        isInteractionLocked: false,
        isPresentationFlowActive: false,
        getPlayerDisplayName: (playerId) => playerId ?? '未知玩家',
        enqueueMotionCues: jest.fn(),
        prefersReducedMotion: true
    };

    return renderHook((props: DrawPresentationOptions) => useGameRoomDrawPresentation(props), {
        initialProps: { ...baseOptions, ...overrides }
    });
};

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
            isPresentationFlowActive: false,
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
        const { result } = renderDrawPresentation({
            drawQueue: [{
                playerId: 'p2',
                card: { id: 'hidden-opponent-card', geishaId: 0, type: 'hidden' as const }
            }],
            consumeDrawEvent,
            getPlayerDisplayName: () => '玩家二'
        });

        expect(result.current.recentDraw).toBe('玩家二 抽到了新卡');
        expect(result.current.isActiveSelfDrawNotification).toBe(false);

        act(() => {
            jest.advanceTimersByTime(520);
        });

        expect(consumeDrawEvent).toHaveBeenCalledTimes(1);
    });

    test('opponent draw still shows safe toast during non-presentation interaction lock', () => {
        const consumeDrawEvent = jest.fn();
        const { result } = renderDrawPresentation({
            drawQueue: [{
                playerId: 'p2',
                card: { id: 'hidden-opponent-card', geishaId: 0, type: 'hidden' as const }
            }],
            consumeDrawEvent,
            isInteractionLocked: true,
            isPresentationFlowActive: false,
            getPlayerDisplayName: () => '玩家二'
        });

        expect(result.current.recentDraw).toBe('玩家二 抽到了新卡');
        act(() => {
            jest.advanceTimersByTime(520);
        });
        expect(consumeDrawEvent).toHaveBeenCalledTimes(1);
    });

    test('defers self draw while a required presentation flow is active', () => {
        const consumeDrawEvent = jest.fn();
        const drawQueue = [{
            playerId: 'p1',
            card: { id: 'self-draw-card', geishaId: 1, type: 'item' as const }
        }];
        const { result, rerender } = renderDrawPresentation({
            drawQueue,
            consumeDrawEvent,
            isPresentationFlowActive: true
        });

        expect(result.current.isActiveSelfDrawNotification).toBe(false);
        expect(result.current.recentDraw).toBeNull();
        expect(result.current.drawHighlightCardId).toBeNull();
        expect(consumeDrawEvent).not.toHaveBeenCalled();

        rerender({
            drawQueue,
            consumeDrawEvent,
            currentPlayerId: 'p1',
            focusSection: 'characterBoard',
            setFocusSection: jest.fn(),
            isInteractionLocked: false,
            isPresentationFlowActive: false,
            getPlayerDisplayName: (playerId) => playerId ?? '未知玩家',
            enqueueMotionCues: jest.fn(),
            prefersReducedMotion: true
        });

        expect(result.current.isActiveSelfDrawNotification).toBe(true);
        expect(consumeDrawEvent).not.toHaveBeenCalled();
    });

    test('resumes deferred self draw and consumes it after viewer opens the hand', () => {
        const consumeDrawEvent = jest.fn();
        const setFocusSection = jest.fn();
        const enqueueMotionCues = jest.fn();
        const drawQueue = [{
            playerId: 'p1',
            card: { id: 'self-draw-card', geishaId: 1, type: 'item' as const }
        }];
        const { result, rerender } = renderDrawPresentation({
            drawQueue,
            consumeDrawEvent,
            setFocusSection,
            enqueueMotionCues,
            isPresentationFlowActive: true
        });

        expect(result.current.isActiveSelfDrawNotification).toBe(false);
        expect(consumeDrawEvent).not.toHaveBeenCalled();

        rerender({
            drawQueue,
            consumeDrawEvent,
            currentPlayerId: 'p1',
            focusSection: 'characterBoard',
            setFocusSection,
            isInteractionLocked: false,
            isPresentationFlowActive: false,
            getPlayerDisplayName: (playerId) => playerId ?? '未知玩家',
            enqueueMotionCues,
            prefersReducedMotion: true
        });

        expect(result.current.isActiveSelfDrawNotification).toBe(true);

        act(() => {
            result.current.handleDrawNotificationViewNow();
        });

        expect(setFocusSection).toHaveBeenCalledWith('handActions');
        expect(result.current.drawHighlightCardId).toBe('self-draw-card');
        expect(enqueueMotionCues).toHaveBeenCalledTimes(1);

        act(() => {
            jest.advanceTimersByTime(720);
        });

        expect(consumeDrawEvent).toHaveBeenCalledTimes(1);
    });

    test('defers opponent draw toast while a required presentation flow is active', () => {
        const consumeDrawEvent = jest.fn();
        const drawQueue = [{
            playerId: 'p2',
            card: { id: 'hidden-opponent-card', geishaId: 0, type: 'hidden' as const }
        }];
        const { result, rerender } = renderDrawPresentation({
            drawQueue,
            consumeDrawEvent,
            isPresentationFlowActive: true,
            getPlayerDisplayName: () => '玩家二'
        });

        expect(result.current.recentDraw).toBeNull();
        act(() => {
            jest.advanceTimersByTime(700);
        });
        expect(consumeDrawEvent).not.toHaveBeenCalled();

        rerender({
            drawQueue,
            consumeDrawEvent,
            currentPlayerId: 'p1',
            focusSection: 'characterBoard',
            setFocusSection: jest.fn(),
            isInteractionLocked: false,
            isPresentationFlowActive: false,
            getPlayerDisplayName: () => '玩家二',
            enqueueMotionCues: jest.fn(),
            prefersReducedMotion: true
        });

        expect(result.current.recentDraw).toBe('玩家二 抽到了新卡');
        act(() => {
            jest.advanceTimersByTime(520);
        });
        expect(consumeDrawEvent).toHaveBeenCalledTimes(1);
    });
});
