import { act, fireEvent, render, screen } from '@testing-library/react';
import { ItemCard } from '@newhandarky/hanakoji-game-types';
import PlayerHand from './PlayerHand';
import { MotionCue, OpeningDealCueStep } from './gameMotion';
import { OpeningHandRevealModel } from './openingHandRevealModel';

const makeCard = (id: string, itemImageUrl = '/card.png'): ItemCard => ({
    id,
    geishaId: 1,
    type: 'sake_01',
    itemImageUrl,
    itemLabel: `卡片 ${id}`
} as ItemCard);

const makeOpeningHandReveal = (cardIds: string[], visibleIds: string[] = []): OpeningHandRevealModel => ({
    status: 'revealing',
    isEligible: true,
    isConcealed: true,
    isInteractionBlocked: true,
    totalCount: cardIds.length,
    revealedCount: visibleIds.length,
    reducedMotion: false,
    sequenceId: 'sequence-1',
    steps: cardIds.map((cardId, index) => ({
        cardId,
        index,
        delayMs: index * 10,
        durationMs: 120,
        visible: visibleIds.includes(cardId)
    }))
});

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

const makeRemovalCue = (id: string, owner: 'self' | 'opponent'): MotionCue => ({
    id,
    kind: 'removal',
    owner,
    cardId: `${owner}-removed-card`,
    sourceZone: owner === 'self' ? 'hand' : 'opponent-side',
    targetZone: 'hand',
    createdAt: 0,
    durationMs: 520,
    delayMs: 90,
    reducedMotion: false
});

const makeDealStep = (
    id: string,
    owner: 'self' | 'opponent',
    isMasked = owner === 'opponent'
): OpeningDealCueStep => ({
    id,
    owner,
    card: makeCard(id, `/${id}.png`),
    slotIndex: owner === 'self' ? 1 : 0,
    slotCount: owner === 'self' ? 2 : 1,
    delayMs: 95,
    durationMs: 260,
    reducedMotion: false,
    isMasked
});

describe('PlayerHand', () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    test('shows card back for concealed opening hand without revealing image', () => {
        const cards = [makeCard('hidden-card', '/secret-card.png')];
        const { container } = render(
            <PlayerHand
                cards={cards}
                onCardSelect={jest.fn()}
                openingHandReveal={makeOpeningHandReveal(['hidden-card'])}
            />
        );

        const cardButton = screen.getByRole('button', { name: '手牌 1 牌背' });
        expect(cardButton).toHaveStyle({ backgroundImage: 'none' });
        expect(container.querySelector('.item-card__opening-back')).toBeInTheDocument();
        expect(container.querySelector('.item-card__fallback-label')).not.toBeInTheDocument();
    });

    test('shows draw-back cue temporarily', () => {
        jest.useFakeTimers();
        const cards = [makeCard('drawn-card', '/drawn-card.png')];
        const cue = makeDrawCue('draw-1', 'drawn-card');
        const { container } = render(
            <PlayerHand
                cards={cards}
                onCardSelect={jest.fn()}
                motionCues={[cue]}
            />
        );

        expect(screen.getByRole('button', { name: '手牌 1 牌背' })).toHaveStyle({ backgroundImage: 'none' });
        expect(container.querySelector('.item-card__opening-back')).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(260);
        });

        expect(screen.queryByRole('button', { name: '手牌 1 牌背' })).not.toBeInTheDocument();
        jest.useRealTimers();
    });

    test('calls onTakeOpeningHand from opening hand gate', () => {
        const onTakeOpeningHand = jest.fn();
        render(
            <PlayerHand
                cards={[makeCard('card-1')]}
                onCardSelect={jest.fn()}
                openingHandReveal={{
                    ...makeOpeningHandReveal(['card-1'], ['card-1']),
                    status: 'pending_take',
                    isConcealed: false,
                    isInteractionBlocked: false
                }}
                onTakeOpeningHand={onTakeOpeningHand}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: '拿取手牌' }));

        expect(onTakeOpeningHand).toHaveBeenCalledTimes(1);
    });

    test('routes opening deal steps into self and opponent lanes without revealing masked artwork', () => {
        const { container } = render(
            <PlayerHand
                cards={[makeCard('card-1')]}
                onCardSelect={jest.fn()}
                openingDealSteps={[
                    makeDealStep('self-deal-card', 'self', false),
                    makeDealStep('opponent-hidden-card', 'opponent', true)
                ]}
            />
        );

        const selfDealCard = container.querySelector('.player-hand-deal-card--self');
        const opponentDealCard = container.querySelector('.player-hand-deal-card--opponent');

        expect(selfDealCard).toHaveStyle({ backgroundImage: 'url(/self-deal-card.png)' });
        expect(opponentDealCard).toHaveClass('is-masked');
        expect(opponentDealCard).toHaveStyle({ backgroundImage: 'none' });
        expect(container.querySelector('.player-hand-stage')).toHaveClass('player-hand-stage--deal-active');
    });

    test('renders removal cues without exposing removed card identity', () => {
        const { container } = render(
            <PlayerHand
                cards={[makeCard('card-1')]}
                onCardSelect={jest.fn()}
                motionCues={[makeRemovalCue('removal-1', 'self')]}
            />
        );

        expect(container.querySelector('.player-hand-removal-cue--self')).toBeInTheDocument();
        expect(document.body.textContent).not.toContain('self-removed-card');
    });

    test('keeps selection aria and missing artwork fallback behavior', () => {
        const onCardSelect = jest.fn();
        render(
            <PlayerHand
                cards={[makeCard('missing-art', '')]}
                onCardSelect={onCardSelect}
            />
        );

        const cardButton = screen.getByRole('button', { name: '卡片 missing-art' });
        expect(screen.getByText('卡片 missing-art')).toBeInTheDocument();
        expect(cardButton).toHaveAttribute('aria-pressed', 'false');

        fireEvent.click(cardButton);

        expect(cardButton).toHaveAttribute('aria-pressed', 'true');
        expect(onCardSelect).toHaveBeenLastCalledWith([expect.objectContaining({ id: 'missing-art' })]);
    });

    test('moves focused hand card with prev and next controls', () => {
        const { container } = render(
            <PlayerHand
                cards={[makeCard('card-1', ''), makeCard('card-2', ''), makeCard('card-3', '')]}
                onCardSelect={jest.fn()}
            />
        );

        expect(container.querySelector('.item-card--focused')).toHaveTextContent('卡片 card-2');

        fireEvent.click(screen.getByRole('button', { name: '下一張手牌' }));
        expect(container.querySelector('.item-card--focused')).toHaveTextContent('卡片 card-3');

        fireEvent.click(screen.getByRole('button', { name: '上一張手牌' }));
        expect(container.querySelector('.item-card--focused')).toHaveTextContent('卡片 card-2');
    });
});
