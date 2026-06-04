import { ItemCard } from '@newhandarky/hanakoji-game-types';
import {
    buildCardIdsKey,
    buildDrawMotionByCardId,
    buildHandCardPresentation,
    buildRevealVisibleCardIds,
    buildSelectedCardIdSet,
    resolveFocusedCardAfterCardsChange,
    resolveFocusedCardIndex,
    resolveNextFocusedCardId,
    splitOpeningDealSteps
} from './playerHandModel';
import { MotionCue, OpeningDealCueStep } from './gameMotion';
import { OpeningHandRevealModel } from './openingHandRevealModel';

const makeCard = (id: string, geishaId = 1, itemImageUrl = '/card.png'): ItemCard => ({
    id,
    geishaId,
    type: 'sake_01',
    itemImageUrl,
    itemLabel: `卡片 ${id}`
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

const makeDealStep = (id: string, owner: 'self' | 'opponent'): OpeningDealCueStep => ({
    id,
    owner,
    card: makeCard(id),
    slotIndex: 0,
    slotCount: 1,
    delayMs: 0,
    durationMs: 100,
    reducedMotion: false,
    isMasked: owner === 'opponent'
});

const openingHandReveal: OpeningHandRevealModel = {
    status: 'revealing',
    isEligible: true,
    isConcealed: true,
    isInteractionBlocked: true,
    totalCount: 2,
    revealedCount: 1,
    reducedMotion: false,
    sequenceId: 'sequence-1',
    steps: [
        { cardId: 'visible-card', index: 0, visible: true, delayMs: 10, durationMs: 120 },
        { cardId: 'hidden-card', index: 1, visible: false, delayMs: 20, durationMs: 120 }
    ]
};

describe('playerHandModel', () => {
    test('builds card id key and selected id set', () => {
        const cards = [makeCard('a'), makeCard('b')];

        expect(buildCardIdsKey(cards)).toBe('a|b');
        expect(buildSelectedCardIdSet(cards).has('a')).toBe(true);
        expect(buildSelectedCardIdSet(cards).has('c')).toBe(false);
    });

    test('splits opening deal steps and draw motion map', () => {
        const selfStep = makeDealStep('self-card', 'self');
        const opponentStep = makeDealStep('opponent-card', 'opponent');
        const drawCue = makeDrawCue('draw-1', 'card-1');

        expect(splitOpeningDealSteps([opponentStep, selfStep])).toEqual({
            selfDealSteps: [selfStep],
            opponentDealSteps: [opponentStep]
        });
        expect(buildDrawMotionByCardId([drawCue]).get('card-1')).toBe(drawCue);
    });

    test('resolves visible reveal card ids and focus fallback', () => {
        expect(buildRevealVisibleCardIds(openingHandReveal).has('visible-card')).toBe(true);
        expect(buildRevealVisibleCardIds(openingHandReveal).has('hidden-card')).toBe(false);

        const cards = [makeCard('a'), makeCard('b'), makeCard('c')];
        expect(resolveFocusedCardIndex(cards, null)).toBe(1);
        expect(resolveFocusedCardIndex(cards, 'c')).toBe(2);
        expect(resolveNextFocusedCardId(cards, 0, 'prev')).toBe('c');
        expect(resolveNextFocusedCardId(cards, 2, 'next')).toBe('a');
    });

    test('preserves focus or picks nearest card after cards change', () => {
        const cards = [makeCard('a'), makeCard('b'), makeCard('c')];
        const nextCards = [makeCard('a'), makeCard('c')];

        expect(resolveFocusedCardAfterCardsChange(cards, [], null)).toBe('b');
        expect(resolveFocusedCardAfterCardsChange(nextCards, ['a', 'b', 'c'], 'b')).toBe('c');
        expect(resolveFocusedCardAfterCardsChange(nextCards, ['a', 'b', 'c'], 'c')).toBe('c');
    });

    test('builds concealed and draw-back card presentation without revealing image', () => {
        const card = makeCard('hidden-card');
        const drawCue = makeDrawCue('draw-1', 'hidden-card');
        const presentation = buildHandCardPresentation({
            card,
            index: 0,
            geishaSet: 'default',
            selectedIdSet: new Set([card.id]),
            focusedCardId: card.id,
            isOpeningHandConcealed: true,
            revealVisibleCardIds: buildRevealVisibleCardIds(openingHandReveal),
            openingHandReveal,
            drawMotionByCardId: new Map([[card.id, drawCue]]),
            drawBackCueIds: new Set([drawCue.id])
        });

        expect(presentation.isSelected).toBe(true);
        expect(presentation.isFocused).toBe(true);
        expect(presentation.isConcealedCard).toBe(true);
        expect(presentation.isDrawBackVisible).toBe(true);
        expect(presentation.backgroundImage).toBe('none');
        expect(presentation.ariaLabel).toBe('手牌 1 牌背');
    });

    test('uses fallback label when artwork is missing', () => {
        const card = makeCard('missing-art', 2, '');
        const presentation = buildHandCardPresentation({
            card,
            index: 1,
            geishaSet: 'default',
            selectedIdSet: new Set(),
            focusedCardId: null,
            isOpeningHandConcealed: false,
            revealVisibleCardIds: new Set(),
            openingHandReveal: null,
            drawMotionByCardId: new Map(),
            drawBackCueIds: new Set()
        });

        expect(presentation.hasCardImage).toBe(false);
        expect(presentation.fallbackLabel).toBe('卡片 missing-art');
        expect(presentation.backgroundImage).toBe('none');
        expect(presentation.ariaLabel).toBeUndefined();
    });
});
