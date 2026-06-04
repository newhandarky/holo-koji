import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ItemCard } from '@newhandarky/hanakoji-game-types';
import { MotionCue } from './gameMotion';
import {
    buildCardIdsKey,
    buildDrawMotionByCardId,
    buildSelectedCardIdSet,
    resolveFocusedCardAfterCardsChange,
    resolveFocusedCardIndex,
    resolveNextFocusedCardId
} from './playerHandModel';

interface UsePlayerHandInteractionOptions {
    cards: ItemCard[];
    motionCues: MotionCue[];
    isOpeningHandInteractionBlocked: boolean;
    onCardSelect: (cards: ItemCard[]) => void;
}

export const usePlayerHandInteraction = ({
    cards,
    motionCues,
    isOpeningHandInteractionBlocked,
    onCardSelect
}: UsePlayerHandInteractionOptions) => {
    const [selected, setSelected] = useState<ItemCard[]>([]);
    const [focusedCardId, setFocusedCardId] = useState<string | null>(null);
    const [drawBackCueIds, setDrawBackCueIds] = useState<Set<string>>(new Set());
    const previousCardIdsRef = useRef<string[]>([]);
    const onCardSelectRef = useRef(onCardSelect);
    const selectedRef = useRef<ItemCard[]>([]);
    const selectedIdSet = useMemo(() => buildSelectedCardIdSet(selected), [selected]);
    const cardIdsKey = useMemo(() => buildCardIdsKey(cards), [cards]);
    const drawMotionByCardId = useMemo(() => buildDrawMotionByCardId(motionCues), [motionCues]);

    useEffect(() => {
        onCardSelectRef.current = onCardSelect;
    }, [onCardSelect]);

    useEffect(() => {
        const timers: number[] = [];

        motionCues
            .filter((cue) => cue.kind === 'draw' && cue.cardId && !cue.reducedMotion)
            .forEach((cue) => {
                setDrawBackCueIds((previous) => {
                    if (previous.has(cue.id)) {
                        return previous;
                    }

                    const next = new Set(previous);
                    next.add(cue.id);
                    return next;
                });

                const timerId = window.setTimeout(() => {
                    setDrawBackCueIds((previous) => {
                        const next = new Set(previous);
                        next.delete(cue.id);
                        return next;
                    });
                }, Math.min(520, Math.max(260, cue.durationMs / 2)));
                timers.push(timerId);
            });

        return () => {
            timers.forEach((timerId) => window.clearTimeout(timerId));
        };
    }, [motionCues]);

    useEffect(() => {
        setSelected([]);
        selectedRef.current = [];
        onCardSelectRef.current([]);
    }, [cardIdsKey]);

    useEffect(() => {
        const previousCardIds = previousCardIdsRef.current;

        setFocusedCardId((previousFocusedCardId) => (
            resolveFocusedCardAfterCardsChange(cards, previousCardIds, previousFocusedCardId)
        ));
        previousCardIdsRef.current = cards.map((card) => card.id);
    }, [cards, cardIdsKey]);

    const focusedIndex = useMemo(() => (
        resolveFocusedCardIndex(cards, focusedCardId)
    ), [cards, focusedCardId]);

    const moveFocus = useCallback((direction: 'prev' | 'next') => {
        setFocusedCardId(resolveNextFocusedCardId(cards, focusedIndex, direction));
    }, [cards, focusedIndex]);

    const toggleCard = useCallback((card: ItemCard) => {
        if (isOpeningHandInteractionBlocked) {
            return;
        }

        setFocusedCardId(card.id);
        const exists = selectedRef.current.some((selectedCard) => selectedCard.id === card.id);
        const nextSelected = exists
            ? selectedRef.current.filter((selectedCard) => selectedCard.id !== card.id)
            : [...selectedRef.current, card];

        selectedRef.current = nextSelected;
        setSelected(nextSelected);
        onCardSelectRef.current(nextSelected);
    }, [isOpeningHandInteractionBlocked]);

    return {
        selectedIdSet,
        focusedCardId,
        focusedIndex,
        drawBackCueIds,
        drawMotionByCardId,
        cardIdsKey,
        moveFocus,
        toggleCard
    };
};
