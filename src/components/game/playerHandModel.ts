import { GeishaSet, ItemCard } from '@newhandarky/hanakoji-game-types';
import { getItemCardImage, getItemCardLabel } from '../../utils/gameData';
import { MotionCue, OpeningDealCueStep } from './gameMotion';
import type { OpeningHandRevealModel } from './openingHandRevealModel';

export interface OpeningDealStepPartitions {
    selfDealSteps: OpeningDealCueStep[];
    opponentDealSteps: OpeningDealCueStep[];
}

export interface HandCardPresentation {
    cardImage: string;
    hasCardImage: boolean;
    fallbackLabel: string;
    isSelected: boolean;
    isFocused: boolean;
    isConcealedCard: boolean;
    revealStep: OpeningHandRevealModel['steps'][number] | undefined;
    drawMotionCue: MotionCue | undefined;
    isDrawBackVisible: boolean;
    ariaLabel: string | undefined;
    backgroundImage: string;
}

export const buildSelectedCardIdSet = (selected: ItemCard[]): Set<string> => (
    new Set(selected.map((card) => card.id))
);

export const buildCardIdsKey = (cards: ItemCard[]): string => (
    cards.map((card) => card.id).join('|')
);

export const buildDrawMotionByCardId = (motionCues: MotionCue[]): Map<string, MotionCue> => {
    const map = new Map<string, MotionCue>();
    motionCues
        .filter((cue) => cue.kind === 'draw' && cue.cardId)
        .forEach((cue) => map.set(cue.cardId!, cue));
    return map;
};

export const splitOpeningDealSteps = (openingDealSteps: OpeningDealCueStep[]): OpeningDealStepPartitions => ({
    selfDealSteps: openingDealSteps.filter((step) => step.owner === 'self'),
    opponentDealSteps: openingDealSteps.filter((step) => step.owner === 'opponent')
});

export const buildRevealVisibleCardIds = (openingHandReveal: OpeningHandRevealModel | null): Set<string> => (
    new Set(openingHandReveal?.steps.filter((step) => step.visible).map((step) => step.cardId) ?? [])
);

export const resolveFocusedCardIndex = (cards: ItemCard[], focusedCardId: string | null): number => {
    if (!focusedCardId) {
        return cards.length > 0 ? Math.floor((cards.length - 1) / 2) : -1;
    }

    const index = cards.findIndex((card) => card.id === focusedCardId);
    if (index >= 0) {
        return index;
    }

    return cards.length > 0 ? Math.floor((cards.length - 1) / 2) : -1;
};

export const resolveNextFocusedCardId = (
    cards: ItemCard[],
    focusedIndex: number,
    direction: 'prev' | 'next'
): string | null => {
    if (cards.length === 0) {
        return null;
    }

    const currentIndex = focusedIndex >= 0 ? focusedIndex : Math.floor((cards.length - 1) / 2);
    const offset = direction === 'prev' ? -1 : 1;
    const nextIndex = (currentIndex + offset + cards.length) % cards.length;
    return cards[nextIndex]?.id ?? null;
};

export const resolveFocusedCardAfterCardsChange = (
    cards: ItemCard[],
    previousCardIds: string[],
    previousFocusedCardId: string | null
): string | null => {
    if (cards.length === 0) {
        return null;
    }

    if (!previousFocusedCardId) {
        return cards[Math.floor((cards.length - 1) / 2)]?.id ?? null;
    }

    const existingIndex = cards.findIndex((card) => card.id === previousFocusedCardId);
    if (existingIndex >= 0) {
        return previousFocusedCardId;
    }

    const previousIndex = previousCardIds.indexOf(previousFocusedCardId);
    if (previousIndex < 0) {
        return cards[Math.floor((cards.length - 1) / 2)]?.id ?? null;
    }

    const nearestIndex = Math.min(previousIndex, cards.length - 1);
    return cards[nearestIndex]?.id ?? cards[cards.length - 1]?.id ?? null;
};

export const buildHandCardPresentation = ({
    card,
    index,
    geishaSet,
    selectedIdSet,
    focusedCardId,
    isOpeningHandConcealed,
    revealVisibleCardIds,
    openingHandReveal,
    drawMotionByCardId,
    drawBackCueIds
}: {
    card: ItemCard;
    index: number;
    geishaSet: GeishaSet;
    selectedIdSet: Set<string>;
    focusedCardId: string | null;
    isOpeningHandConcealed: boolean;
    revealVisibleCardIds: Set<string>;
    openingHandReveal: OpeningHandRevealModel | null;
    drawMotionByCardId: Map<string, MotionCue>;
    drawBackCueIds: Set<string>;
}): HandCardPresentation => {
    const cardImage = getItemCardImage(card, geishaSet);
    const hasCardImage = cardImage.trim().length > 0;
    const fallbackLabel = getItemCardLabel(card, geishaSet);
    const isSelected = selectedIdSet.has(card.id);
    const isFocused = focusedCardId === card.id;
    const isConcealedCard = isOpeningHandConcealed && !revealVisibleCardIds.has(card.id);
    const revealStep = openingHandReveal?.steps.find((step) => step.cardId === card.id);
    const drawMotionCue = drawMotionByCardId.get(card.id);
    const isDrawBackVisible = Boolean(drawMotionCue && drawBackCueIds.has(drawMotionCue.id));
    const shouldShowBack = isConcealedCard || isDrawBackVisible;

    return {
        cardImage,
        hasCardImage,
        fallbackLabel,
        isSelected,
        isFocused,
        isConcealedCard,
        revealStep,
        drawMotionCue,
        isDrawBackVisible,
        ariaLabel: shouldShowBack ? `手牌 ${index + 1} 牌背` : undefined,
        backgroundImage: shouldShowBack ? 'none' : hasCardImage ? `url(${cardImage})` : 'none'
    };
};
