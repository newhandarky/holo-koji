import { act, renderHook } from '@testing-library/react';
import { ItemCard } from '@newhandarky/hanakoji-game-types';
import { MotionCue } from './gameMotion';
import { usePlayerHandInteraction } from './usePlayerHandInteraction';

const makeCard = (id: string): ItemCard => ({
    id,
    geishaId: 1,
    type: 'sake_01'
} as ItemCard);

const makeDrawCue = (id: string, cardId: string): MotionCue => ({
    id,
    kind: 'draw',
    owner: 'self',
    cardId,
    sourceZone: 'hand',
    targetZone: 'hand',
    createdAt: 0,
    durationMs: 520,
    delayMs: 0,
    reducedMotion: false
});

describe('usePlayerHandInteraction', () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    test('resets selection when hand cards change', () => {
        const onCardSelect = jest.fn();
        const firstCards = [makeCard('a'), makeCard('b')];
        const { result, rerender } = renderHook(({ cards }) => usePlayerHandInteraction({
            cards,
            motionCues: [],
            isOpeningHandInteractionBlocked: false,
            onCardSelect
        }), {
            initialProps: { cards: firstCards }
        });

        act(() => {
            result.current.toggleCard(firstCards[0]);
        });
        expect(onCardSelect).toHaveBeenLastCalledWith([firstCards[0]]);

        rerender({ cards: [makeCard('c'), makeCard('d')] });

        expect(onCardSelect).toHaveBeenLastCalledWith([]);
        expect(result.current.selectedIdSet.size).toBe(0);
    });

    test('toggles card selection and focused card', () => {
        const onCardSelect = jest.fn();
        const cards = [makeCard('a'), makeCard('b'), makeCard('c')];
        const { result } = renderHook(() => usePlayerHandInteraction({
            cards,
            motionCues: [],
            isOpeningHandInteractionBlocked: false,
            onCardSelect
        }));

        act(() => {
            result.current.toggleCard(cards[2]);
        });

        expect(result.current.selectedIdSet.has('c')).toBe(true);
        expect(result.current.focusedCardId).toBe('c');
        expect(result.current.focusedIndex).toBe(2);
        expect(onCardSelect).toHaveBeenLastCalledWith([cards[2]]);
    });

    test('does not toggle card while opening hand interaction is blocked', () => {
        const onCardSelect = jest.fn();
        const cards = [makeCard('a')];
        const { result } = renderHook(() => usePlayerHandInteraction({
            cards,
            motionCues: [],
            isOpeningHandInteractionBlocked: true,
            onCardSelect
        }));

        act(() => {
            result.current.toggleCard(cards[0]);
        });

        expect(result.current.selectedIdSet.size).toBe(0);
        expect(onCardSelect).toHaveBeenCalledTimes(1);
        expect(onCardSelect).toHaveBeenCalledWith([]);
    });

    test('moves focus with wrap-around', () => {
        const cards = [makeCard('a'), makeCard('b'), makeCard('c')];
        const { result } = renderHook(() => usePlayerHandInteraction({
            cards,
            motionCues: [],
            isOpeningHandInteractionBlocked: false,
            onCardSelect: jest.fn()
        }));

        expect(result.current.focusedCardId).toBe('b');

        act(() => {
            result.current.moveFocus('prev');
        });
        expect(result.current.focusedCardId).toBe('a');

        act(() => {
            result.current.moveFocus('prev');
        });
        expect(result.current.focusedCardId).toBe('c');
    });

    test('removes draw-back cue after timer completes', () => {
        jest.useFakeTimers();
        const cue = makeDrawCue('draw-1', 'a');
        const cards = [makeCard('a')];
        const motionCues = [cue];
        const { result } = renderHook(() => usePlayerHandInteraction({
            cards,
            motionCues,
            isOpeningHandInteractionBlocked: false,
            onCardSelect: jest.fn()
        }));

        expect(result.current.drawBackCueIds.has('draw-1')).toBe(true);

        act(() => {
            jest.advanceTimersByTime(260);
        });

        expect(result.current.drawBackCueIds.has('draw-1')).toBe(false);
    });
});
