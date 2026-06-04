import { act, fireEvent, render, screen } from '@testing-library/react';
import { ItemCard } from '@newhandarky/hanakoji-game-types';
import PlayerHand from './PlayerHand';
import { MotionCue } from './gameMotion';
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
});
